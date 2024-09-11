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

import { Changeset, ChangesetCollection, File, Link } from "@scm-manager/ui-types";
import { apiClient } from "@scm-manager/ui-api";
import { useInfiniteQuery } from "react-query";

export const useHistoryDownload = (file: File) => {
  const initialLink = (file._links.history as Link).href;
  const { isLoading, error, data, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery<
    ChangesetCollection,
    Error,
    ChangesetCollection
  >(
    ["link", initialLink],
    ({ pageParam }) => apiClient.get(pageParam || initialLink).then(response => response.json()),
    {
      getNextPageParam: lastPage => (lastPage._links.next as Link)?.href
    }
  );

  let fnp;
  if (hasNextPage) {
    fnp = () => {
      fetchNextPage();
    };
  }

  return {
    isLoading,
    error,
    isFetchingNextPage,
    fetchNextPage: fnp,
    data: concat(data?.pages)
  };
};

const concat = (changesets?: ChangesetCollection[]): Changeset[] | undefined => {
  if (!changesets || changesets.length === 0) {
    return;
  }
  return changesets.map(collection => collection._embedded?.changesets || []).flat();
};
