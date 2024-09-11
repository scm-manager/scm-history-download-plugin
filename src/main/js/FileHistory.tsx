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

import React, { FC } from "react";
import { extensionPoints } from "@scm-manager/ui-extensions";
import {
  ErrorNotification,
  Icon,
  Loading,
  ChangesetId,
  DateFromNow,
  LinkStyleButton
} from "@scm-manager/ui-components";
import { SelectedFile, useFileTreeContext } from "./context";
import { File, Link } from "@scm-manager/ui-types";
import { useHistoryDownload } from "./useHistoryDownload";
import { useTranslation } from "react-i18next";

type DownloadLinkProps = {
  file: File;
};

const DownloadLink: FC<DownloadLinkProps> = ({ file }) => {
  const [t] = useTranslation("plugins");
  const downloadLink = (file._links.self as Link)?.href;
  if (downloadLink) {
    return (
      <a href={downloadLink} title={t("scm-history-download-plugin.download.title")} download={file.name}>
        <Icon name="download" color="link" />
      </a>
    );
  }
  return null;
};

type FetchMoreProps = {
  fetchNextPage?: () => void;
};

const FetchMore: FC<FetchMoreProps> = ({ fetchNextPage }) => {
  const [t] = useTranslation("plugins");

  if (!fetchNextPage) {
    return <p>{t("scm-history-download-plugin.controls.noMore")}</p>;
  }

  return (
    <LinkStyleButton onClick={fetchNextPage}>
      <Icon name="chevron-down" color="secondary-more" className="mr-3" />
      {t("scm-history-download-plugin.controls.fetchMore")}
    </LinkStyleButton>
  );
};

type ControlProps = {
  isFetchingNextPage: boolean;
  fetchNextPage?: () => void | undefined;
  close: () => void;
};

const Controls: FC<ControlProps> = ({ isFetchingNextPage, fetchNextPage, close }) => {
  const [t] = useTranslation("plugins");

  return (
    <div className="level is-fullwidth has-background-secondary-less p-1 px-3">
      <div className="level-left">
        {isFetchingNextPage ? (
          <p>{t("scm-history-download-plugin.controls.loading")}</p>
        ) : (
          <FetchMore fetchNextPage={fetchNextPage} />
        )}
      </div>
      <LinkStyleButton className="left-right" onClick={close}>
        {t("scm-history-download-plugin.controls.hide")}
        <Icon name="times-circle" color="secondary-more" className="ml-3" />
      </LinkStyleButton>
    </div>
  );
};

type TableProps = SelectedFile & {
  close: () => void;
};

const FileHistoryTable: FC<TableProps> = ({ repository, revision, file, close }) => {
  const { isLoading, error, data, isFetchingNextPage, fetchNextPage } = useHistoryDownload(file);

  if (error) {
    return <ErrorNotification error={error} />;
  }

  if (isLoading || !data) {
    return <Loading />;
  }

  return (
    <>
      <table className="table table-hover table-sm is-fullwidth">
        {data.map(c => (
          <tr key={c.id}>
            <td>
              <Icon name="history" />
            </td>
            <td>
              <ChangesetId repository={repository} changeset={c} />
            </td>
            <td>
              <DateFromNow date={c.date} />
            </td>
            <td className="is-word-break">{c.description}</td>
            <td>
              <DownloadLink file={file} />
            </td>
          </tr>
        ))}
      </table>
      <Controls isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} close={close} />
    </>
  );
};

const FileHistory: FC<extensionPoints.ReposSourcesTreeRowProps> = ({ file }) => {
  const { selectedFile, unselect } = useFileTreeContext();
  if (!selectedFile || file !== selectedFile.file) {
    return null;
  }

  return (
    <tr>
      <td colSpan={6}>
        <FileHistoryTable {...selectedFile} close={unselect} />
      </td>
    </tr>
  );
};

export default FileHistory;
