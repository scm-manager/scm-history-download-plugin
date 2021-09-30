/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
