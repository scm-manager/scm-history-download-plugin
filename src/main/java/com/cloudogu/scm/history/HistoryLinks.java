/*
 * Copyright (c) 2020 - present Cloudogu GmbH
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

package com.cloudogu.scm.history;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import sonia.scm.api.v2.resources.LinkBuilder;
import sonia.scm.api.v2.resources.ScmPathInfoStore;

class HistoryLinks {

  private final Provider<ScmPathInfoStore> scmPathInfoStore;

  @Inject
  HistoryLinks(Provider<ScmPathInfoStore> scmPathInfoStore) {
    this.scmPathInfoStore = scmPathInfoStore;
  }

  String createFileHistoryLink(String namespace, String name, String revision, String path) {
    LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), FileHistoryResource.class);
    return linkBuilder.method("getFileHistory").parameters(namespace, name, revision, path).href();
  }
}
