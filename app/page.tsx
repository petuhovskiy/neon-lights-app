import { GroupBinInfo, Query, SystemDetails, fetchGroupInfo, fetchQueries, fetchQueriesGroups, fetchRegionsMap, fetchSystemDetails, runSelect1, timestampsFromStrings } from "@/lib/db";
import { cookies } from 'next/headers';
import { checkAuth } from "@/lib/keyauth";
import ControlPanel from "@/components/home/control-panel";
import { QueriesResults, Group } from "@/components/home/queries-results";
import { TimeChunks, splitRangeIntoChunks } from "@/lib/intervals";
import { uniqueBinId } from "@/lib/bins";
import ErrorCard from "@/components/home/error-card";

export default async function Home({
  searchParams,
}: {
  // https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  let user = checkAuth(cookies());

  console.log("searchParams: " + JSON.stringify(searchParams));

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
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const tommorowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const filters = getParam('filters', `driver != 'go-neonapi'`);
  const groupBy = getParam('groupBy', 'region_id');
  const fromStr = getParam('from', yesterdayStart.toISOString());
  const toStr = getParam('to', tommorowStart.toISOString());
  const selectedBin = getParam('selectedBin', '');
  const detailsFlag = getParam('details', 'false') == 'true';

  let fetchDetails: Promise<SystemDetails | undefined> = Promise.resolve(undefined);
  if (detailsFlag) {
    fetchDetails = fetchSystemDetails();
  }

  try {
    const [regionsMap, timeRange, qgroups, details] = await Promise.all([
        fetchRegionsMap(),
        timestampsFromStrings(fromStr, toStr),
        fetchQueriesGroups(filters, groupBy, fromStr, toStr),
        fetchDetails,
    ]);
    const chunks = splitRangeIntoChunks(timeRange);

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
          <ControlPanel filtersStr={filters} groupByStr={groupBy} fromStr={fromStr} toStr={toStr} detailsFlag={detailsFlag}/>
          <QueriesResults details={details} groups={groups} regions={regionsMap} selectedBin={selectedBin} selectedBinQueries={fullQueries} selectedGroup={selectedGroup} />
        </div>
      </>
    );
  } catch (e) {
    return (
      <>
        <div className="my-10 grid w-full max-w-screen-lg animate-fade-up grid-cols-1 gap-5 px-5 xl:px-0">
          <ControlPanel filtersStr={filters} groupByStr={groupBy} fromStr={fromStr} toStr={toStr} detailsFlag={detailsFlag}/>
          <ErrorCard error={e} />
        </div>
      </>
    )
  }
}
