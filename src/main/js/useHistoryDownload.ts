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

import { File, HalRepresentation, Link } from "@scm-manager/ui-types";
import { apiClient } from "@scm-manager/ui-api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Embedded, HalRepresentationWithEmbedded } from "@scm-manager/ui-types/src/hal";

export type FileHistoryEntry = HalRepresentation & {
  id: string;
  date: Date;
  description: string;
};

type EmbeddedFileHistory = {
  history: FileHistoryEntry[];
} & Embedded;

type FileHistoryCollection = HalRepresentationWithEmbedded<EmbeddedFileHistory> & {
  page: number;
  hasMore: number;
};

type FileHistoryCollectionPages = {
  pages: FileHistoryCollection[];
};
export const useHistoryDownload = (file: File) => {
  const initialLink = (file._links["file-history"] as Link).href;
  const { isLoading, error, data, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery<
    FileHistoryCollection,
    Error,
    FileHistoryCollectionPages
  >({
    queryKey: ["link", initialLink],
    queryFn: ({ pageParam }) => apiClient.get(pageParam as string).then((response) => response.json()),
    getNextPageParam: (lastPage) => (lastPage._links.next as Link)?.href,
    initialPageParam: initialLink,
  });

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
    data: concat(data?.pages),
  };
};

const concat = (changesets?: FileHistoryCollection[]): FileHistoryEntry[] | undefined => {
  if (!changesets || changesets.length === 0) {
    return;
  }
  return changesets.map((collection) => collection._embedded?.history || []).flat();
};
