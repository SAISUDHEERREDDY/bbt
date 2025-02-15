#-------------------------------------------------------------------------
# -remove me-	Template Makefile for use with platform-build.mk
#
# -replace me-	Copyright 2022 Hughes, an Echostar Company
#-------------------------------------------------------------------------


# external build dependencies
# -remove me- 	Use this exact variable name to specify dependency archives that will automatically be downloaded when container(s) are built using the "up" target
# -remove me- 		* archives are pulled from an internal web server using curl on YOUR host system
# -remove me-	ex:
build_deps := \
	base-debian-dev.tgz \
	ini-parsing-dev.tgz \



# -remove me-	default target (for building) as specified by GNU Makefile standards
# -remove me-		* MUST come before all other targets including those from platform-builds.mk
# -remove me-		* This is where the switch between the host system and docker should occur.
# -remove me-		  The DOCKER_CONTAINER environment variable is set in the docker-compose.yml file.
.PHONY: all
all:
ifeq ($(DOCKER_CONTAINER),1)
# -remove me-	Fill in here with native build commands
# -remove me-	ex:
	$(MAKE) -C lib
else
# -remove me-	Call docker-compose exec against the build container service specified in docker-compose.yml
# -remove me-	ex:
	docker-compose exec BUILD_SERVICE_NAME $(MAKE)
endif


# helper to pull submodule manually
.PHONY: checkout
checkout:
	@# fetch/update git submodules
	git submodule update --init --recursive --remote


# add native build environment targets and variables (see top of platform-builds.mk for summary)
# -remove me-	* MUST specify a topdir variable that points to the top of the source directory (root directory of a cloned repository).
# -remove me-	* It MUST be a relative path from the directory where THIS Makefile is running.
topdir := .
-include $(topdir)/build-context/platform-builds.mk


.PHONY: install
install:
# -remove me-	Fill in here with native install commands.
# -remove me-		* DESTDIR will be replaced by $(pkgdir) when running inside the docker environment.
# -remove me-	ex:
	install -d $(DESTDIR)/usr/lib
	install -m 644 lib/mylib.so $(DESTDIR)/usr/lib/


# manual packaging
.PHONY: package
package:
# -remove me-	Cleanup and creation of $(pkgdir) (provided by platform-builds.mk) is left to the developer to allow for corner cases where this is unwanted.
	rm -rf $(pkgdir)
	install -d $(pkgdir)

# -remove me-	Run install commands for packaging using the debutils_fakeroot target. DESTDIR will be set to $(pkgdir) inside the container.
# -remove me-		* MUST specify cmd="<command> [args]"
# -remove me-		* fakeroot is used to package things as the root user while leaving real ownership with the user
# -remove me-	ex:
	$(MAKE) debutils_fakeroot cmd="$(MAKE) install"

# -remove me-	Create a package by using the debutils_mkpkg target.
# -remove me-		* MUST specify debdir=<path relative to $(topdir)> where the packaging files reside (ie: control, preinst, postinst...)
# -remove me-	ex:
	$(MAKE) debutils_mkpkg debdir=DEBIAN


# cleanup
.PHONY: clean
clean:
# -remove me-	Cleanup of $(pkgdir) and packages is left to the user.
	rm -f *.deb
	rm -rf $(pkgdir)

.PHONY: distclean
distclean:
# -remove me-	It is a good idea to have a distclean target that:
# -remove me-		* brings down the docker environment using the "down" target from platform-builds.mk
# -remove me-		* removes any downloaded build dependencies (*.tgz in this example)
# -remove me-		* removes an app-specific build image if generated by docker-compose.yml (use the image name as supplied in docker-compose.yml)
# -remove me-		* runs the "clean_build_context" target from platform-builds.mk (to remove any temporary files in the submodule; ie: .build_info.mk)
	$(MAKE) down >/dev/null
	$(MAKE) clean
	rm -f *.tgz
	docker rmi -f 127.0.0.1/$(product)/myapp:$(product_version)
	$(MAKE) clean_build_context
