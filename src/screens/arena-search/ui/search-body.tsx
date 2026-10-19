import { useTranslation } from "react-i18next";

import type { useArenaSearch } from "../model/use-arena-search";

import NoticeView from "./notice-view";
import SearchingView from "./searching-view";
import VersusView from "./versus-view";

interface ISearchBody {
  search: ReturnType<typeof useArenaSearch>;
}

const SearchBody = ({ search }: ISearchBody) => {
  const { t } = useTranslation();
  const { opponent } = search;

  if (search.inMatch !== null) {
    return (
      <NoticeView
        title={t("search.inMatch.title")}
        text={t("search.inMatch.text")}
        primary={{
          label: t("search.inMatch.rejoin"),
          testID: "search-rejoin",
          onPress: search.handleRejoin,
        }}
        secondary={{
          label: t("common.later"),
          testID: "search-later",
          onPress: search.handleLeave,
        }}
      />
    );
  }
  if (search.phase === "stopped") {
    return (
      <NoticeView
        title={t("search.stopped")}
        text={t("search.stoppedText")}
        primary={{
          label: t("search.again"),
          testID: "search-again",
          onPress: search.handleSearchAgain,
        }}
        secondary={{
          label: t("search.toArena"),
          testID: "search-to-arena",
          onPress: search.handleLeave,
        }}
      />
    );
  }
  if (opponent === null) {
    return (
      <SearchingView
        arena={search.arena}
        activeMap={search.activeMap}
        waitedSec={search.waitedSec}
        isAsyncAvailable={search.isAsyncAvailable}
        onCancel={search.handleCancel}
      />
    );
  }
  if (search.phase === "found" && opponent.isBot) {
    return (
      <NoticeView
        title={t("search.captured")}
        text={t("search.capturedText")}
        primary={{
          label: t("search.toMatch"),
          testID: "search-to-match",
          onPress: search.handleToMatch,
        }}
        secondary={{
          label: t("common.cancel"),
          testID: "search-cancel",
          onPress: search.handleCancel,
        }}
      />
    );
  }
  return (
    <VersusView
      opponent={opponent}
      profile={search.arena?.profile}
      firstPlayer={search.firstPlayer}
    />
  );
};

export default SearchBody;
