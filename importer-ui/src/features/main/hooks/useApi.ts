import { useMemo, useState } from "react";
import { Importer, Template, Upload } from "../../../api/types";
import useGetImporter from "../../../api/useGetImporter";
import useGetOrganization from "../../../api/useGetOrganization";
import useGetUpload from "../../../api/useGetUpload";
import useReview from "../../../api/useReview";
import useMutableLocalStorage from "./useMutableLocalStorage";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export default function useApi(importerId: string, sdkDefinedTemplate: string, checkOrganizationStatus: boolean, schemaless?: boolean) {
  const [tusId, setTusId] = useMutableLocalStorage(importerId + "-tusId", "");
  const [importStartTime, setImportStartTime] = useMutableLocalStorage(importerId + "-importStartTime", "");
  const tusWasStored = useMemo(() => !!tusId, []);
  const [enabledReview, setEnabledReview] = useState(false);

  // Load importer & template for the first step
  const {
    data: importer = {} as Importer,
    isLoading: importerIsLoading,
    error: importerError,
  } = useGetImporter(importerId, sdkDefinedTemplate, schemaless);
  const { template = {} as Template } = importer;

  const { data: organizationStatus, isLoading: statusIsLoading = {} } = useGetOrganization(importerId, checkOrganizationStatus);

  // Load upload for the second step
  const { data: upload = {} as Upload, isLoading: uploadIsLoading, error: uploadError } = useGetUpload(tusId);
  const { is_stored: uploadIsStored } = upload || {};

  const uploadId = upload?.id || "";
  const importStartTimestamp = parseInt(importStartTime, 10);

  if (importStartTimestamp && Date.now() - importStartTimestamp > ONE_HOUR_IN_MS) {
    setTusId("");
    setImportStartTime("");
  }

  if (!importStartTimestamp && tusWasStored) {
    setImportStartTime(Date.now().toString());
  }

  const {
    data: review,
    isLoading: reviewIsLoading,
    isFetching: reviewIsFetching,
    error: reviewError,
  }: any = useReview(uploadId, !!uploadId && enabledReview, {
    staleTime: 0,
  });
  const reviewIsStored = enabledReview ? review?.is_stored || false : false;

  if (importer?.template?.is_sdk_defined && upload?.is_stored && upload?.template) {
    importer.template = upload.template;
  }

  return {
    tusId,
    setTusId,
    tusWasStored,
    importer,
    importerIsLoading,
    importerError,
    organizationStatus,
    statusIsLoading,
    template,
    upload,
    uploadIsLoading,
    uploadError,
    uploadIsStored,
    review,
    reviewIsLoading: reviewIsLoading || reviewIsFetching,
    reviewError,
    reviewIsStored,
    enabledReview,
    setEnabledReview,
  };
}
