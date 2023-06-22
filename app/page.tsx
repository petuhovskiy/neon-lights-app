import Card from "@/components/home/card";
import Balancer from "react-wrap-balancer";
import { DEPLOY_URL } from "@/lib/constants";
import { Github, Twitter } from "@/components/shared/icons";
import WebVitals from "@/components/home/web-vitals";
import ComponentGrid from "@/components/home/component-grid";
import Image from "next/image";
import { nFormatter } from "@/lib/utils";
import { GroupBinInfo, Query, fetchGroupInfo, fetchQueries, fetchQueriesGroups, fetchRegionsMap, runSelect1, timestampsFromStrings } from "@/lib/db";
import { cookies } from 'next/headers';
import { checkAuth } from "@/lib/keyauth";
import ControlPanel from "@/components/home/control-panel";
import { QueriesResults, Group } from "@/components/home/queries-results";
import { TimeChunks, splitRangeIntoChunks } from "@/lib/intervals";
import { uniqueBinId } from "@/lib/bins";

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

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const tommorowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const filters = getParam('filters', 'TRUE');
  const groupBy = getParam('groupBy', 'region_id');
  const fromStr = getParam('from', todayStart.toISOString());
  const toStr = getParam('to', tommorowStart.toISOString());
  const selectedBin = getParam('selectedBin', '');

  const tz = await runSelect1();
  console.log("TIMEZONE: " + JSON.stringify(tz[0]));

  const regionsMap = await fetchRegionsMap();
  const timeRange = await timestampsFromStrings(fromStr, toStr);
  const chunks = splitRangeIntoChunks(timeRange);
  const qgroups = await fetchQueriesGroups(filters, groupBy, fromStr, toStr);

  const groups = await Promise.all(qgroups.map((group) => {
    return fetchGroupInfo(filters, fromStr, toStr, chunks, group);
  }));

  let hasSelectedBin = false;
  let selectedGroup: Group | undefined = undefined;
  let selectedBinInfo: GroupBinInfo | undefined = undefined;

  for (const group of groups) {
    for (const bin of group.bins) {
      if (uniqueBinId(group, bin) == selectedBin) {
        hasSelectedBin = true;
        selectedGroup = group;
        selectedBinInfo = bin;
        break;
      }
    }
  }

  let fullQueries: Query[] | undefined = undefined;
  if (hasSelectedBin && selectedGroup && selectedBinInfo) {
    fullQueries = await fetchQueries(filters, fromStr, toStr, chunks, selectedGroup, selectedBinInfo);
  }

  return (
    <>
      <div className="my-10 grid w-full max-w-screen-lg animate-fade-up grid-cols-1 gap-5 px-5 xl:px-0">
        <ControlPanel filtersStr={filters} groupByStr={groupBy} fromStr={fromStr} toStr={toStr}/>
        <QueriesResults groups={groups} regions={regionsMap} selectedBin={selectedBin} selectedBinQueries={fullQueries} selectedGroup={selectedGroup} />
      </div>
    </>
  );
}
