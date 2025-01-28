#-------------------------------------------------------------------------
# Copyright 2019-2022 Hughes, an Echostar Company
#-------------------------------------------------------------------------

# setting this keeps npm looking at the project directory inside the build-env target
export HOME := /mnt/src/$(shell basename $(shell pwd))

# required to retrieve private NPM modules
export NPM_TOKEN := d60a15bb-0605-489d-887c-ae642f757d51



CURDIR 		:= $(shell pwd)
export PATH := $(CURDIR)/node_modules/.bin:$(CURDIR)/node_modules/.bin/gulp:$(CURDIR)/node_modules/phantomjs/lib/phantom/bin:$(PATH)


.PHONY: all
all:
ifeq ($(DOCKER_CONTAINER),1)
	$(MAKE) build
else
	docker-compose exec platform-build $(MAKE)
endif


builds:
	rm -rf $@
	mkdir $@

node_modules: package.json package-lock.json .npmrc
	npm i

.PHONY: build
build: node_modules
	$(MAKE) build-generic build-orange

.PHONY: build-generic
build-generic: builds
	ng build --progress=false --prod
	node write-version.js
	mv dist/apps/angular-bbt builds/generic
	cp apps/angular-bbt/.htaccess builds/generic/

.PHONY: build-%
build-%: builds
	ng build --progress=false --prod --c=$*
	node write-version.js
	mv dist/apps/angular-bbt builds/$*
	cp apps/angular-bbt/.htaccess builds/$*/


# helper to pull submodule manually
.PHONY: checkout
checkout:
	@# fetch/update git submodules
	git submodule update --init --recursive --remote


# add native build environment targets and variables (see top of platform-builds.mk for summary)
topdir := .
-include build-context/platform-builds.mk


.PHONY: install-%
install-%:
	install -d $(DESTDIR)/opt/local/ror
	cp -a builds/$* $(DESTDIR)/opt/local/ror/public


# manual packaging
.PHONY: package
package: package-generic package-orange

.PHONY: package-generic
package-generic:
	rm -rf $(pkgdir)
	install -d $(pkgdir)

	$(MAKE) debutils_fakeroot cmd="$(MAKE) install-generic"
	$(MAKE) debutils_mkpkg debdir=DEBIAN

.PHONY: package-orange
package-orange:
	rm -rf $(pkgdir)
	install -d $(pkgdir)

	$(MAKE) debutils_fakeroot cmd="$(MAKE) install-orange"
	$(MAKE) debutils_mkpkg debdir=DEBIAN.orange


# cleanup
.PHONY: clean
clean:
	rm -f *.deb
	rm -rf dist builds $(pkgdir)

.PHONY: distclean
distclean:
	$(MAKE) down >/dev/null
	$(MAKE) clean
	rm -f .bash_history .angular-config.json
	rm -rf .npm node_modules .cache
	$(MAKE) clean_build_context
