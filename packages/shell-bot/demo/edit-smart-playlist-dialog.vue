<template>
  <zm-dialog
    append-to-body
    :visible="visible"
    custom-class="playlist-dialog"
    width="43%"
    @update:visible="$emit('update:visible', false)"
  >
    <h1 slot="title">
      {{ $t("recording.playlist_edit_title") }}
    </h1>
   
    <div v-loading="loadingPlaylistInfo" class="mgb-lg">
    
      <zm-collapse v-model="activeSmartCriteria">
     
        <zm-collapse-item
          v-if="isShowIndicators"
          :class="{ 'active-criteria': isIndicatorSelected }"
          :title="$t('recording.playlist_smart_indicators_title')"
          name="2"
        >
          <div class="smart-item-margin">
            <zm-select
              v-model="selectedIndicators"
              value-key="valueKey"
              filterable
              remote
              :remote-method="handleFilterIndicator"
              multiple
              clearable
              :multiple-limit="50"
              style="display: block"
              :placeholder="
                $t('recording.playlist_smart_indicators_placeholder')
              "
            >
              <zm-option
                v-for="item in indicatorInfoOptions"
                :key="item.valueKey"
                :value="item"
                :label="item.value"
              >
                <span
                  class="zm-dropdown__item-title"
                  style="float: left"
                  :style="
                    (item.type === 2 || item.type === 3) &&
                    !indicatorSearchInput
                      ? { marginLeft: '16px' }
                      : item.type === 1
                      ? { fontWeight: 600 }
                      : {}
                  "
                  >{{ item.value }}</span
                >
                <span
                  v-if="item.type === 2 || item.type === 3"
                  class="zm-dropdown__item-desc"
                  style="font-size: 13px; float: right"
                  >{{ item.indicator_name }}</span
                >
              </zm-option>
            </zm-select>
          </div>
        </zm-collapse-item>
      </zm-collapse>
    </div>
   
  </zm-dialog>
</template>

<script>
import { debounce } from "shared/js/utils";
import { mapState, createNamespacedHelpers } from "vuex";
import { updateSmartPlaylist, getPlaylistInfo } from "@api/playlist";
import { getCustomerList, getLicensedUsers } from "@api/deal";
import TeamSelector from "./team-selector-for-playlist.vue";
import ScoreCardSelector from "@components/filters/team-selector/team-selector";

const { mapActions: playlistMapActions, mapState: playlistMapState } =
  createNamespacedHelpers("playlist");
const { mapState: mapCoachingState } = createNamespacedHelpers("coaching");
const PAGE_SIZE = 50;
export default {
  name: "EditSmartPlaylistDialog",
  components: { TeamSelector, ScoreCardSelector },
  props: {
    visible: Boolean,
    playlistInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
      loadingPlaylistInfo: false,
      form: {
        playlistName: "",
      },
      rules: {
        playlistName: [
          { required: true, message: "Input playlist name", trigger: "blur" },
        ],
      },

      selectedScore: {
        min: 0,
        max: 100,
      },
      scorecardOptions: [],
    };
  },

  watch: {
    visible(val) {
      if (val === true) {
        this.form = {
          playlistName: this.playlistInfo.name,
        };
        this.fetchPlaylistInfo();
      }
    },
  },
  methods: {
    hideDialog() {
      // clear data before close
      this.form = {
        playlistName: "",
      };
      this.isRepChecked = false;
      this.selectedReps = [];
      this.isAccountChecked = false;
      this.selectedAccounts = [];
      this.isStageChecked = false;
      this.selectedStages = [];
      this.isTopicChecked = false;
      this.selectedTopics = [];
      this.isTeamChecked = false;
      this.selectedTeams = [];
      this.selectedIndicators = [];
      this.selectedScorecards = [];
      this.selectedScore = { min: 0, max: 100 };
      this.isDealOutcomeChecked = false;
      this.selectedDealOutcome = "Won";
      this.activeSmartCriteria = [];
      this.$emit("update:visible", false);
    },
    getNewScorecard() {
      return {
        id: "",
        score_range: {
          min: 0,
          max: 10,
        },
      };
    },
    fetchPlaylistInfo() {
      this.loadingPlaylistInfo = true;
      return getPlaylistInfo({
        playlist_id: this.playlistInfo.id,
      })
        .then(({ info }) => {
          const {
            customer_accounts: customerAccounts,
            reps,
            stages,
            topics,
            teams,
            indicators,
            scorecards = [],
            deal_outcome,
          } = info;
          if (customerAccounts?.length) {
            this.isAccountChecked = true;
            this.selectedAccounts = customerAccounts.map(
              (acc) => acc.customer_crm_account_id
            );
            this.customerOptions = customerAccounts.map((acc) => ({
              label: acc.customer_crm_account_name,
              value: acc.customer_crm_account_id,
            }));
          }
          if (reps?.length) {
            this.isRepChecked = true;
            this.repOptions = reps.map(
              ({ user_name: label = "", user_id: value = "" }) => ({
                label,
                value,
              })
            );
            this.$nextTick(() => {
              this.selectedReps = reps.map((rep) => rep.user_id);
            });
          }
          if (stages?.length) {
            this.isStageChecked = true;
            this.selectedStages = stages;
          }
          if (topics?.length) {
            this.isTopicChecked = true;
            this.selectedTopics = topics.map((item) => {
              return { ...item, valueKey: item.name + item.type };
            });
          }
          if (teams?.length) {
            this.isTeamChecked = true;
            this.selectedTeams = teams;
          }
          if (
            this.isRepChecked ||
            this.isAccountChecked ||
            this.isStageChecked ||
            this.isTopicChecked ||
            this.isTeamChecked
          ) {
            this.activeSmartCriteria.push("1");
          }
          if (indicators?.length) {
            const indicatorList = indicators.map((item) => {
              return {
                ...item,
                valueKey:
                  item.type === 3
                    ? item.theme_id
                    : item.indicator_id + item.value + item.type,
              };
            });
            this.selectedIndicators = indicatorList;
            this.indicatorInfoOptions = this.indicatorInfoList;
            this.activeSmartCriteria.push("2");
          }
          if (scorecards?.scorecard_info?.length) {
            this.selectedScorecards = scorecards.scorecard_info.map(
              ({ id }) => {
                return this.scorecardList.find((item) => item.id === id);
              }
            );
            this.selectedScore = { ...scorecards.scorecard_range };
            this.activeSmartCriteria.push("4");
          }
          if (deal_outcome) {
            this.isDealOutcomeChecked = true;
            this.selectedDealOutcome = deal_outcome;
            this.activeSmartCriteria.push("3");
          }
        })
        .finally(() => (this.loadingPlaylistInfo = false));
    },
    setupPlaylist() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return;
        }
        if (
          this.form.playlistName ===
          this.$t("recording.playlist_type_my_favorite")
        ) {
          this.$message.error(this.$t("playlist_name_cannot_duplicate"));
          return;
        }
        this.loading = true;

        await this.updateSmartPlaylist();
        this.$emit("refresh-list");
      });
    },
    updateSmartPlaylist() {
      const submitData = {
        id: this.playlistInfo.id,
        name: this.form.playlistName,
        customer_accounts: this.isAccountChecked
          ? this.selectedAccounts.map((accountId) => ({
              customer_crm_account_id: accountId,
            }))
          : [],
        stages: this.isStageChecked ? this.selectedStages : [],
        reps: this.isRepChecked
          ? this.selectedReps.map((userId) => ({ user_id: userId }))
          : [],
        topics: this.isTopicChecked ? this.selectedTopics : [],
        indicators: this.selectedIndicators || [],
        deal_outcome: this.isDealOutcomeChecked ? this.selectedDealOutcome : "",
        scorecards:
          this.enableScorecard && this.isScoreSelected
            ? {
                scorecard_info: this.selectedScorecards.map(({ id }) => {
                  return { id };
                }),
                scorecard_range: { ...this.selectedScore },
              }
            : {},
      };
      if (this.enableTeams) {
        submitData.teams = this.isTeamChecked ? this.selectedTeams : [];
      }
      return updateSmartPlaylist(submitData)
        .then(() => {
          this.$emit("refresh-list");
          this.hideDialog();
          this.loading = false;
        })
        .catch((e) => {
          this.loading = false;
          this.$message({ type: "error", message: e.errorMessage });
        });
    },
    fetchCustomer: debounce(function (searchText, page) {
      const params = {
        page,
        page_size: PAGE_SIZE,
        search_text: searchText,
      };
      this.customerLoading = true;
      getCustomerList(params)
        .then((res) => {
          if (page === 1) {
            this.customerHasMore = true;
            this.customerOptions = [];
          }
          const list = (res || []).map((item) => ({
            value: item.customer_crm_account_id,
            label: item.customer_crm_account_name,
          }));
          let temp = this.customerOptions;
          temp = temp.concat(list);
          const result = new Map();
          temp.forEach((item) => {
            if (!result.has(item.value)) {
              result.set(item.value, item);
            }
          });
          this.customerOptions = [...result.values()];
          if (list.length === 0) {
            this.customerHasMore = false;
          }
        })
        .catch((e) => {
          this.$message.error(e.errorMessage);
        })
        .finally(() => {
          this.customerLoading = false;
        });
    }, 300),
    fetchReps: debounce(function (searchText, page) {
      if (this.repSearchText !== searchText || page === 1) {
        this.repExclusiveKey = "";
        this.repHasMore = false;
        this.repOptions = [];
      }
      const params = {
        page,
        page_size: PAGE_SIZE,
        exclusive_start_key_str: this.repExclusiveKey,
        search_text: searchText,
      };
      this.repLoading = true;
      this.repSearchText = searchText;
      getLicensedUsers(params)
        .then((res) => {
          this.repExclusiveKey = res.exclusive_start_key_str;
          const list = (res?.data || []).map(
            ({ name: label = "", zm_user_id: value = "" }) => ({
              value,
              label,
            })
          );
          const result = new Map();
          [...this.repOptions, ...list].forEach((item) => {
            if (!result.has(item.value)) {
              result.set(item.value, item);
            }
          });
          this.repOptions = [...result.values()];
          this.repHasMore = this.repExclusiveKey !== "-1";
        })
        .catch((e) => {
          this.$message.error(e.errorMessage);
        })
        .finally(() => {
          this.repLoading = false;
        });
    }, 300),
    handleRepChange(event) {
      this.selectedReps = [...event];
    },
    handleFilterIndicator(query) {
      this.indicatorSearchInput = query;
      if (query !== "") {
        this.indicatorInfoOptions = this.indicatorInfoList.filter((item) => {
          return item.value.toLowerCase().indexOf(query.toLowerCase()) > -1;
        });
      } else {
        this.indicatorInfoOptions = this.indicatorInfoList;
      }
    },
    handleDeleteScorecard() {
      this.selectedScorecards = [];
      this.selectedScore = {
        min: 0,
        max: 100,
      };
    },
    ...playlistMapActions(["fetchCreateSmartPlaylistInfo"]),
  },
};
</script>

<style lang="scss" scoped>
.smart-item-margin {
  margin-top: 10px;
}
</style>
