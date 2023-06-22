import Card from "@/components/home/card";
import Balancer from "react-wrap-balancer";
import { DEPLOY_URL } from "@/lib/constants";
import { Github, Twitter } from "@/components/shared/icons";
import WebVitals from "@/components/home/web-vitals";
import ComponentGrid from "@/components/home/component-grid";
import Image from "next/image";
import { nFormatter } from "@/lib/utils";
import { fetchGroupInfo, fetchQueriesGroups, timestampsFromStrings } from "@/lib/db";
import { cookies } from 'next/headers';
import { checkAuth } from "@/lib/keyauth";
import ControlPanel from "@/components/home/control-panel";
import { QueriesResults, Group } from "@/components/home/queries-results";
import { splitRangeIntoChunks } from "@/lib/intervals";

export default async function Home({
  searchParams,
}: {
  // https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  let user = checkAuth(cookies());

  function getParam(key: string, defaultValue: string) {
    const value = searchParams[key];
    if (value === undefined) {
      return defaultValue;
    }
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }

  const filters = getParam('filters', 'TRUE');
  const groupBy = getParam('groupBy', 'region_id');
  const fromStr = getParam('from', '2023-06-20');
  const toStr = getParam('to', '2023-06-22');

  const timeRange = await timestampsFromStrings(fromStr, toStr);
  const chunks = splitRangeIntoChunks(timeRange);
  const pgGroupRows = await fetchQueriesGroups(filters, groupBy, fromStr, toStr);

  const groups = await Promise.all(pgGroupRows.map((row) => {
    return fetchGroupInfo(filters, fromStr, toStr, chunks, row);
  }));

  return (
    <>
      <div className="my-10 grid w-full max-w-screen-lg animate-fade-up grid-cols-1 gap-5 px-5 xl:px-0">
        <ControlPanel filtersStr={filters} groupByStr={groupBy} fromStr={fromStr} toStr={toStr}/>
        <QueriesResults groups={groups} />
      </div>
    </>
  );
}
