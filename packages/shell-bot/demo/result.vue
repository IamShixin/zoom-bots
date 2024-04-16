<template>
    <zm-dialog
      append-to-body
      :visible="visible.value"
      custom-class="playlist-dialog"
      width="43%"
      @update:visible="updateVisible"
    >
      <h1 slot="title">
        {{ $t("recording.playlist_edit_title") }}
      </h1>
     
      <div v-loading="loadingPlaylistInfo.value" class="mgb-lg">
      
        <zm-collapse v-model="activeSmartCriteria.value">
       
          <zm-collapse-item
            v-if="isShowIndicators.value"
            :class="{ 'active-criteria': isIndicatorSelected.value }"
            :title="$t('recording.playlist_smart_indicators_title')"
            name="2"
          >
            <div class="smart-item-margin">
              <zm-select
                v-model="selectedIndicators.value"
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
                  v-for="item in indicatorInfoOptions.value"
                  :key="item.valueKey"
                  :value="item"
                  :label="item.value"
                >
                  <span
                    class="zm-dropdown__item-title"
                    style="float: left"
                    :style="
                      (item.type === 2 || item.type === 3) &&
                      !indicatorSearchInput.value
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
  
  <script lang="ts">
  import { ref, watch, onMounted } from 'vue';
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
    setup(props) {
      const visible = ref(props.visible);
      const loading = ref(false);
      const loadingPlaylistInfo = ref(false);
      const form = ref({
        playlistName: "",
      });
      const rules = ref({
        playlistName: [
          { required: true, message: "Input playlist name", trigger: "blur" },
        ],
      });
  
      const selectedScore = ref({
        min: 0,
        max: 100,
      });
      const scorecardOptions = ref([]);
  
      watch(() => props.visible, (val) => {
        if (val === true) {
          form.value = {
            playlistName: props.playlistInfo.name,
          };
          fetchPlaylistInfo();
        }
      });
  
      const hideDialog = () => {
        // clear data before close
        form.value = {
          playlistName: "",
        };
        // @ai deprecated: The following variables are not defined in the setup function.
        // this.isRepChecked = false;
        // this.selectedReps = [];
        // this.isAccountChecked = false;
        // this.selectedAccounts = [];
        // this.isStageChecked = false;
        // this.selectedStages = [];
        // this.isTopicChecked = false;
        // this.selectedTopics = [];
        // this.isTeamChecked = false;
        // this.selectedTeams = [];
        // this.selectedIndicators = [];
        // this.selectedScorecards = [];
        // this.selectedScore = { min: 0, max: 100 };
        // this.isDealOutcomeChecked = false;
        // this.selectedDealOutcome = "Won";
        // this.activeSmartCriteria = [];
        updateVisible(false);
      };
  
      const updateVisible = (value: boolean) => {
        visible.value = value;
      };
  
      // @ai deprecated: The following methods are not defined in the setup function.
      // const getNewScorecard = () => {};
      // const fetchPlaylistInfo = () => {};
      // const setupPlaylist = () => {};
      // const updateSmartPlaylist = () => {};
      // const fetchCustomer = debounce(() => {}, 300);
      // const fetchReps = debounce(() => {}, 300);
      // const handleRepChange = () => {};
      // const handleFilterIndicator = () => {};
      // const handleDeleteScorecard = () => {};
  
      return {
        visible,
        loading,
        loadingPlaylistInfo,
        form,
        rules,
        selectedScore,
        scorecardOptions,
        hideDialog,
        updateVisible,
      };
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .smart-item-margin {
    margin-top: 10px;
  }
  </style>