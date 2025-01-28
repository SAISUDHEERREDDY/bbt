#
# helpers to support local development using Docker for native platform builds
#
#
# User targets:
#
#	up						bring up the docker build/deb-utils environment
#							(missing dependency archives are downloaded as this is where the container build will occur)
#
#	down					take down the docker build/deb-utils environment
#
#	shell					enter the build environment shell
#
#	ushell					enter the deb-utils environment shell
#
#	get-build-var var=<varname>
#							show the value of one of the build environment variables derived from etc/build-info.conf
#
#	clean_build_context		remove any generated artifacts (ie: .build_info.mk)
#
#
# Utility targets (for Make files):
#
#	debutils_fakeroot cmd=<shell-command>
#		Run a shell command in the deb-utils container under fakeroot.
#		This should be used for installing to $(pkgdir).
#
#		cmd					shell command to run (use bash -c '...' to run multiple commands)
#
#
#	debutils_mkpkg debdir=<path> [product_version=<version>]
#		Create a debian package using the given Debian package metadata directory.
#		The given $(debdir) will be copied into $(pkgdir) for modification.
#		The package will contain all files installed in $(pkgdir).
#
#		debdir				path to Debian package meta-data directory
#							MUST BE RELATIVE TO THE TOP SOURCE DIRECTORY!
#
#		product_version		version to replace PROD_VERSION keyword in package control file
#							default is the value in etc/build-info.conf
#
#		EXTRA_MKDEBPKG_FLAGS	environment variable to add custom flags for mkdebpkg (ie: --pkg-deps)
#
#
#	get_next_pkg_version cpath=<path>
#		Get the value of the next package version.
#		This is the version that would be used if a package is generated at this point in time.
#
#		cpath				path to Debian package 'control' file relative to the current directory
#
#
#	clean_build_context
#		Remove any generated context artifacts (ie: .build_info.mk)
#
#	%.tgz					downloads dependency archive
#
#
#
# Variables Provided:
#		pkgdir							path relative to $(topdir) to a temporary directory used for creating Debian packages
#										(the user MUST create this path before calling debutils_fakeroot or debutils_mkpkg)
#
#		user_id							numeric user id for host system user; used through docker-compose.yml to keep any new file permissions correct
#
#		group_id						numeric group id for host system user; same purpose as user_id
#
#		-- vars below provided by $(_context_repo_path)/.build_info.mk which is derived from $(_context_repo_path)/etc/build-info.conf --
#			NOTE: any of these can be manually overridden in the .build_info.mk file; but beware that calling clean_build_context target will remove the file
#
#		docker_registry					hostname of our internal docker registry
#
#		docker_registry_url				full docker registry url
#
#		docker_registry_credentials		name of Jenkins credentials to use for registry access
#
#		debutils_docker_image			image name:version of the debian utilities image used for Debian packaging
#
#		product							name of product this build is for
#
#		product_version					version of product this build is for
#
#		debootstrap_arch				native platform Debian arch value
#
#		debootstrap_suite				native platform Debian suite value
#
#		debootstrap_mirror				native platform Debian mirror url
#
#		iptables_version				version of iptables that will be compiled and installed on the platform os
#
#		kernel_version					version of linux kernel that will be compiled and installed on the platform os
#
#		build_artifact_url				url to directory where build artifacts for this specific product/version are found
#
#		build_image						full docker image name (including registry) of the native platform os build environment
#
#
# Copyright 2022 Hughes, an Echostar Company


#------------------------------------------------------------------------------
# variables
#------------------------------------------------------------------------------
topdir ?= .
export pkgdir := $(topdir)/.pkg

ifndef NO_DOCKER_COMPOSE
# compose call with common flags
_compose := docker-compose -f $(topdir)/docker-compose.yml
endif

# get current path relative to topdir
_abs_topdir := $(abspath $(topdir))
_relative_curdir := .$(subst $(_abs_topdir),,$(CURDIR))

# path to build-context
_context_repo_path := $(topdir)/build-context


# build-info.conf
# 	convert build-info.conf into makefile syntax for inclusion
#		- this needs to be cross-platform compatible (ie: Linux and Mac)
#		- cannot use direct conversion using Make $(eval) because newlines always get removed by Make when returning from $(shell)
#	  	  (thus a temp file is the only way to convert shell variables into Make syntax)
_build_info := $(_context_repo_path)/.build_info.mk
$(shell $(_context_repo_path)/bin/conf2make.sh $(_context_repo_path)/etc/build-info.conf > $(_build_info))

include $(_build_info)


# user/group id
#	- The $(shell ...) command runs prior to evaluating '?=' so
#	  no user override is possible unless it is separated out from the assignment.
_uid := $(shell id -u)
_gid := $(shell id -g)

export user_id	?= $(_uid)
export group_id	?= $(_gid)


#------------------------------------------------------------------------------
# targets
#------------------------------------------------------------------------------


# docker-compose
.PHONY: up
up: $(build_deps)
	@set -e; \
	if [ $$($(_compose) ps -a -q 2>/dev/null | wc -l) -eq 0 ]; then \
		$(_compose) up --build -d; \
	else \
		echo "environment already running"; \
	fi

.PHONY: down
down:
	@set -e; \
	if [ $$($(_compose) ps -a -q 2>/dev/null | wc -l) -gt 0 ]; then \
		$(_compose) down; \
	else \
		echo "environment already down"; \
	fi


.PHONY: build_docker_images
build_docker_images:
	$(_compose) build


# build dependencies
#	- expects to be run on the host system
%.tgz:
	curl -o $@ --fail $(build_artifact_url)/$@


# shells
.PHONY: shell
shell:
	@set -e; \
	if [ -z "$(service)" ]; then \
		echo; \
		echo "ERROR: please specify the service name using 'service=<name>' (see output below for associated container names)"; \
		echo; \
		echo "running services:"; \
		echo "-----------------"; \
		$(_compose) ps --services 2>/dev/null; \
		echo; \
		exit 1; \
	fi
	$(_compose) exec -ti -e product=$(product) -e product_version=$(product_version) $(service) /bin/bash -c "cd $(_relative_curdir) && /bin/bash -i"

.PHONY: ushell
ushell:
	$(MAKE) shell service=deb-utils


# packaging
#
#	fakeroot: Starting faked manually seems to avoid some sort of race condition
#		  	  happening when it starts automatically (when only fakeroot is called).
#		  	  It's probably something with docker networking and response time for port setup.

.PHONY: debutils_mkpkg
debutils_mkpkg:
	$(_compose) exec deb-utils bash -c "cd $(_relative_curdir) && faked-tcp && fakeroot-tcp -- mkdebpkg --debdir $(debdir) --install-root \$$(realpath $(pkgdir)) --prod-version $(product_version) $(EXTRA_MKDEBPKG_FLAGS)"


.PHONY: debutils_fakeroot
debutils_fakeroot:
	$(_compose) exec deb-utils bash -c "cd $(_relative_curdir) && export DESTDIR=\$$(realpath $(pkgdir)) && faked-tcp && fakeroot-tcp -- $(cmd)"


.PHONY: get_next_pkg_version
get_next_pkg_version:
	@set -e; \
	if [ -z "$(cpath)" ]; then \
		echo; \
		echo "ERROR: please specify cpath=<relative-path-to-control-file>"; \
		echo; \
		exit 1; \
	fi; \
	pname=$$(cat $(cpath) | grep '^Package:' | cut -d : -f 2-); \
	if [ -z "$$pname" ]; then \
		echo; \
		echo "ERROR: could not determine package name from $(cpath)"; \
		echo; \
	fi; \
	$(_compose) exec deb-utils bash -c "cd $(_relative_curdir) && get-next-pkg-version --control=$(cpath) --repo $(product)-$(product_version) --prod-version $(product_version) $$pname"


# utilities
.PHONY: get-build-var
get-build-var:
	@set -e; \
	if [ -z "$(var)" ]; then \
		echo "ERROR: missing variable name argument (specify 'var=' when calling this target)" 1>&2; \
		exit 1; \
	fi; \
	echo -n "$($(var))"


# local cleanup
#  	- the target name should be unique and not just "clean" or it will conflict when included in superrepository Make files
.PHONY: clean_build_context
clean_build_context:
	rm -f $(_build_info)
