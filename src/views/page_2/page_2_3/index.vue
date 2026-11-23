<template>
  <Layout :aside="true" :main="true">

    <template v-slot:aside-left-tools>
      <LeftToolbar :toolsData="leftTools" @selectItem="handleToolSelect" />
    </template>

    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>库存记录</h1>
          </template>
          <div class="box-main-content">
            <!-- 库存状态饼图 -->
            <InventoryPie
              :data="inventoryPieData"
              :bgImage="require('@/assets/images/page_2_3/pie_bg.png')"
              style="margin-bottom: 8px;"
            />

            <SearchInput @confirm="handleSearch" style="margin-bottom: 8px;" />
            <div class="card-list-container list1">
              <DeviceMonitorCard v-for="(item, index) in filteredInventoryList" :key="'inv-' + index" :config="item"
                :groupWidths="['21%', '35%', '35%']" :tagWidth="'5.5rem'"/>
            </div>
          </div>
        </Box>
      </div>
    </template>
<!-- 
    <div class="action-buttons">
      <div class="action-btn disabled">
        <span>车间</span>
      </div>
      <div class="action-btn disabled">
        <span>仓库</span>
      </div>
      <div class="action-btn disabled">
        <span>设备</span>
      </div>
    </div> -->

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box1" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>仓储出入库记录</h1>
          </template>
          <div class="box-main-content">
            <div class="level-one-tabs">
              <div
                v-for="tab in levelOneTabs"
                :key="tab.value"
                class="tab-item"
                :class="{
                  active: selectedTabs.includes(tab.value),
                  'sole-active': selectedTabs.includes(tab.value) && selectedTabs.length === 1
                }"
                @click="handleLevelOneClick(tab.value)"
              >
                <span class="tab-label">{{ tab.label }}</span>
              </div>
            </div>

            <PeriodTabs v-model="tabPeriod"
              :tabs="[{ label: '周', key: 'week' }, { label: '月', key: 'month' }, { label: '年', key: 'year' }]" />

            <!-- 在这里完成折线图 -->
            <WarehouseRecordChart :chartData="currentChartData" />

            <div class="card-list-container list2">
              <DeviceMonitorCard v-for="(item, index) in currentWarehouseRecordList" :key="'rec-' + index" :config="item"
                :groupWidths="['40%', '60%']" :tagWidth="'5.5rem'" />
            </div>
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>盘库记录</h1>
          </template>
          <div class="box-main-content">
            <WorkshopTable :columns="tableColumns" :tableData="tableData" headerColor="#9BF8FF" />
          </div>
        </Box>
      </div>
    </template>
  </Layout>
</template>

<script>
import Layout from "@/layout/index.vue";
import Box from "@/layout/box.vue";
import DeviceMonitorCard from "@/components/card/deviceMonitorCard.vue";
import SearchInput from "@/components/searchInput.vue";
import PeriodTabs from "@/components/periodTabs.vue";
import WarehouseRecordChart from "./components/warehouse-record-chart.vue";
import WorkshopTable from "@/components/table/workshopTable.vue";
import LeftToolbar from "@/components/toolBar/leftToolbar.vue";
import InventoryPie from "./components/inventory-pie.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_3",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    DeviceMonitorCard,
    SearchInput,
    PeriodTabs,
    WarehouseRecordChart,
    WorkshopTable,
    LeftToolbar,
    InventoryPie
  },
  data() {
    return {
      leftTools: [
        {
          id: "1",
          label: "设备",
          icon: require("@/assets/images/page_2_3/设备-默认.png"),
          activeIcon: require("@/assets/images/page_2_3/设备-选中.png"),
          isActive: false,
        },
        {
          id: "2",
          label: "货架",
          icon: require("@/assets/images/page_2_3/货架-默认.png"),
          activeIcon: require("@/assets/images/page_2_3/货架-选中.png"),
          isActive: false,
        },
        {
          id: "3",
          label: "人员",
          icon: require("@/assets/images/page_2_3/人员-默认.png"),
          activeIcon: require("@/assets/images/page_2_3/人员-选中.png"),
          isActive: false,
        }
      ],
      searchQuery: '',
      selectedTabs: ['outbound', 'inbound'],
      levelOneTabs: [
        { label: '出库', value: 'outbound' },
        { label: '入库', value: 'inbound' }
      ],
      tabPeriod: 'month',
      tableColumns: [
        { label: '编号', key: 'id', flex: 1.5, type: 'common' },
        { label: '人员', key: 'person', flex: 0.5, type: 'common' },
        { label: '时间', key: 'time', flex: 1.5, type: 'common' },
        { label: '状态', key: 'status', flex: 0.6, type: 'status-dot' }
      ],
      tableData: [
        { id: 'CK-202502-001', person: '张三', time: '02-28 08:30', status: '正常' },
        { id: 'CK-202502-002', person: '李四四', time: '02-27 16:00', status: '正常' },
        { id: 'CK-202502-003', person: '梁XX', time: '02-27 16:00', status: '异常' },
        { id: 'CK-202502-004', person: '刘XX', time: '02-27 16:00', status: '正常' },
      ],
      chartDataMap: {
        week: {
          xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          yData: [
            { name: '出库', data: [18, 24, 15, 30, 22, 10, 8] },
            { name: '入库', data: [22, 18, 20, 26, 19, 12, 6] }
          ]
        },
        month: {
          xData: ['第一周', '第二周', '第三周', '第四周'],
          yData: [
            { name: '出库', data: [50, 34, 56, 44] },
            { name: '入库', data: [74, 50, 65, 48] }
          ],
          yAxisMax: 100,
          yAxisInterval: 20
        },
        year: {
          xData: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          yData: [
            { name: '出库', data: [180, 160, 210, 195, 220, 240, 230, 215, 200, 190, 175, 205] },
            { name: '入库', data: [200, 175, 230, 210, 240, 255, 245, 225, 215, 205, 190, 220] }
          ]
        }
      },
      inventoryList: [
        {
          headerTag: '滚筒铸件',
          title: 'M-001',
          status: '充足',
          content: [
            [
              { label: '类别', value: '铸件' },
              { label: '库存', value: '28', unit: '件' },
              { label: '货位', value: 'A-01-02' }
            ]
          ]
        },
        {
          headerTag: '液压密封套件',
          title: 'M-002',
          status: '告警',
          content: [
            [
              { label: '类别', value: '密封件' },
              { label: '库存', value: '3', unit: '套' },
              { label: '货位', value: 'B-02-01' }
            ]
          ]
        },
        {
          headerTag: '主轴轴承',
          title: 'M-003',
          status: '充足',
          content: [
            [
              { label: '类别', value: '铸件' },
              { label: '库存', value: '12', unit: '个' },
              { label: '货位', value: 'A-03-01' }
            ]
          ]
        },
        {
          headerTag: '刀库电机',
          title: 'M-004',
          status: '耗尽',
          content: [
            [
              { label: '类别', value: '电气' },
              { label: '库存', value: '2', unit: '台' },
              { label: '货位', value: 'C-01-01' }
            ]
          ]
        },
        {
          headerTag: '箱体毛坯',
          title: 'M-005',
          status: '充足',
          content: [
            [
              { label: '类别', value: '铸件' },
              { label: '库存', value: '45', unit: '件' },
              { label: '货位', value: 'A-02-03' }
            ]
          ]
        },
        {
          headerTag: '箱体毛坯',
          title: 'M-006',
          status: '充足',
          content: [
            [
              { label: '类别', value: '铸件' },
              { label: '库存', value: '45', unit: '件' },
              { label: '货位', value: 'A-02-03' }
            ]
          ]
        },
        {
          headerTag: '箱体毛坯',
          title: 'M-007',
          status: '充足',
          content: [
            [
              { label: '类别', value: '铸件' },
              { label: '库存', value: '45', unit: '件' },
              { label: '货位', value: 'A-02-03' }
            ]
          ]
        },
        {
          headerTag: '箱体毛坯',
          title: 'M-007',
          status: '充足',
          content: [
            [
              { label: '类别', value: '铸件' },
              { label: '库存', value: '45', unit: '件' },
              { label: '货位', value: 'A-02-03' }
            ]
          ]
        },
        {
          headerTag: '箱体毛坯',
          title: 'M-008',
          status: '充足',
          content: [
            [
              { label: '类别', value: '铸件' },
              { label: '库存', value: '45', unit: '件' },
              { label: '货位', value: 'A-02-03' }
            ]
          ]
        }
      ],
      warehouseRecordAllData: {
        week: [
          {
            type: 'outbound',
            headerTag: '主轴轴承',
            title: '10 件',
            status: 'OUT-202502-081',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '梁xx' },
                { label: '时间', value: '周一 08:00' }
              ],
              { type: 'status', value: '出库' }
            ]
          },
          {
            type: 'inbound',
            headerTag: '液压密封套件',
            title: '2 套',
            status: 'IN-202502-042',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '梁xx' },
                { label: '时间', value: '周二 10:30' }
              ],
              { type: 'status', value: '入库' }
            ]
          },
          {
            type: 'inbound',
            headerTag: '滚筒铸件',
            title: '20 件',
            status: 'IN-202502-083',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '梁xx' },
                { label: '时间', value: '周三 14:00' }
              ],
              { type: 'status', value: '入库' }
            ]
          },
          {
            type: 'outbound',
            headerTag: '箱体毛坯',
            title: '20 件',
            status: 'OUT-202502-043',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '梁xx' },
                { label: '时间', value: '周四 14:00' }
              ],
              { type: 'status', value: '出库' }
            ]
          },
          {
            type: 'outbound',
            headerTag: '主轴轴承',
            title: '10 件',
            status: 'OUT-202502-084',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '张xx' },
                { label: '时间', value: '周五 09:00' }
              ],
              { type: 'status', value: '出库' }
            ]
          }
        ],
        month: [
          {
            type: 'outbound',
            headerTag: '主轴轴承',
            title: '42 件',
            status: 'OUT-202502-M01',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '梁xx' },
                { label: '时间', value: '02-05 08:00' }
              ],
              { type: 'status', value: '出库' }
            ]
          },
          {
            type: 'inbound',
            headerTag: '液压密封套件',
            title: '12 套',
            status: 'IN-202502-M02',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '李xx' },
                { label: '时间', value: '02-10 10:30' }
              ],
              { type: 'status', value: '入库' }
            ]
          },
          {
            type: 'outbound',
            headerTag: '箱体毛坯',
            title: '65 件',
            status: 'OUT-202502-M03',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '王xx' },
                { label: '时间', value: '02-15 14:00' }
              ],
              { type: 'status', value: '出库' }
            ]
          },
          {
            type: 'inbound',
            headerTag: '滚筒铸件',
            title: '80 件',
            status: 'IN-202502-M04',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '梁xx' },
                { label: '时间', value: '02-20 09:00' }
              ],
              { type: 'status', value: '入库' }
            ]
          },
          {
            type: 'outbound',
            headerTag: '刀库电机',
            title: '8 台',
            status: 'OUT-202502-M05',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '张xx' },
                { label: '时间', value: '02-25 11:00' }
              ],
              { type: 'status', value: '出库' }
            ]
          }
        ],
        year: [
          {
            type: 'outbound',
            headerTag: '主轴轴承',
            title: '520 件',
            status: 'OUT-2025-Y01',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '梁xx' },
                { label: '时间', value: '2025-03' }
              ],
              { type: 'status', value: '出库' }
            ]
          },
          {
            type: 'inbound',
            headerTag: '液压密封套件',
            title: '148 套',
            status: 'IN-2025-Y02',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '李xx' },
                { label: '时间', value: '2025-06' }
              ],
              { type: 'status', value: '入库' }
            ]
          },
          {
            type: 'outbound',
            headerTag: '箱体毛坯',
            title: '780 件',
            status: 'OUT-2025-Y03',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '王xx' },
                { label: '时间', value: '2025-09' }
              ],
              { type: 'status', value: '出库' }
            ]
          },
          {
            type: 'inbound',
            headerTag: '滚筒铸件',
            title: '960 件',
            status: 'IN-2025-Y04',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '梁xx' },
                { label: '时间', value: '2025-05' }
              ],
              { type: 'status', value: '入库' }
            ]
          },
          {
            type: 'outbound',
            headerTag: '刀库电机',
            title: '96 台',
            status: 'OUT-2025-Y05',
            statusType: 'text',
            content: [
              [
                { label: '负责人', value: '张xx' },
                { label: '时间', value: '2025-11' }
              ],
              { type: 'status', value: '出库' }
            ]
          }
        ]
      }
    };
  },
  computed: {
    inventoryPieData() {
      // const countMap = {};
      // this.inventoryList.forEach((item) => {
      //   countMap[item.status] = (countMap[item.status] || 0) + 1;
      // });
      // const order = ["充足", "告警", "耗尽"];
      // return order
      //   .filter((name) => countMap[name] !== undefined)
      //   .map((name) => ({ name, value: countMap[name] }));
    },
    currentChartData() {
      const periodData = this.chartDataMap[this.tabPeriod];
      const nameMap = { outbound: '出库', inbound: '入库' };
      const colorMap = { '出库': '#DBA23E', '入库': '#0FDACB' };
      const selectedNames = this.selectedTabs.map(t => nameMap[t]);
      const filteredYData = periodData.yData.filter(s => selectedNames.includes(s.name));
      return {
        ...periodData,
        yData: filteredYData,
        colors: filteredYData.map(s => colorMap[s.name])
      };
    },
    currentWarehouseRecordList() {
      const allData = this.warehouseRecordAllData[this.tabPeriod] || [];
      return allData.filter(item => this.selectedTabs.includes(item.type));
    },
    filteredInventoryList() {
      if (!this.searchQuery) return this.inventoryList;
      const lowerQuery = this.searchQuery.toLowerCase();
      return this.inventoryList.filter(item => {
        return item.headerTag.toLowerCase().includes(lowerQuery) ||
          item.title.toLowerCase().includes(lowerQuery) ||
          item.status.toLowerCase().includes(lowerQuery);
      });
    }
  },
  async mounted() {

  },

  methods: {
    handleLevelOneClick(val) {
      if (this.selectedTabs.includes(val)) {
        if (this.selectedTabs.length > 1) {
          this.selectedTabs = this.selectedTabs.filter(v => v !== val);
        }
      } else {
        this.selectedTabs = [...this.selectedTabs, val];
      }
    },
    async handleToolSelect(selectedItem) {
      const toolId = Number(selectedItem.id);

      if (typeof this.closeAll === "function") {
        await this.closeAll();
      }

      if (!selectedItem.isActive) return;

      const handler = this.toolHandlers?.[toolId];
      const data = this.toolData?.[toolId];
      if (typeof handler === "function") {
        await handler(data, toolId);
      }
    },
    handleSearch(val) {
      this.searchQuery = val;
    }
  },

  async beforeDestroy() {

  },
};
</script>

<style lang="scss" scoped>
.level-one-tabs {
  display: flex;
  align-items: center;
  height: 2.37rem;
  background: rgba(30, 45, 65, 0.4);
  border: 1px solid rgba(80, 100, 120, 0.6);
  border-radius: 2px;
  position: relative;
  margin-bottom: 12px;
  flex-shrink: 0;

  .tab-item {
    flex: 1;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    position: relative;
    color: rgba(255, 255, 255, 0.6);
    font-size: var(--font-size-14);
    font-family: var(--font-family-primary-Regular);
    transition: color 0.3s;

    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }

    &.active {
      color: #fff;
      font-family: var(--font-family-primary-Medium);

      &::before {
        content: "";
        position: absolute;
        top: -1px;
        left: -1px;
        width: 100%;
        height: 115%;
        background: url('~@/assets/images/img/tab_active.png') no-repeat center bottom;
        background-size: 100% 100%;
        z-index: 0;
        pointer-events: none;
      }
    }

    &.sole-active {
      cursor: not-allowed;
    }

    .tab-label {
      position: relative;
      font-size: var(--font-size-14);
      z-index: 1;
    }

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 1px;
      background: rgba(80, 100, 120, 0.6);
    }

    &.active::after,
    &:has(+ .active)::after {
      display: none;
    }
  }
}

.box-main-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.content-left {
  .box1 {
    height: 97.5%;
  }
}

.content-right {
  .box1 {
    height: 66.5%;
  }

  .box2 {
    height: 26%;
  }
}

.card-list-container {
  padding: 0.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: calc(100% - 0.5rem);

  &.list1 {
    height: calc(82% - 0.5rem);
  }

  &.list2 {
    height: calc(57% - 0.5rem);

    &::-webkit-scrollbar {
      width: 0px;
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #63768D;
    border-radius: 3px;

    &:hover {
      background: #748292;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  z-index: 10;

  .action-btn {
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, rgba(45, 154, 222, 0.3), rgba(45, 154, 222, 0.1));
    border: 1px solid rgba(45, 154, 222, 0.5);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;

    span {
      font-size: var(--font-size-16);
      color: rgba(238, 248, 253, 0.9);
      font-family: var(--font-family-primary-Regular);
    }

    &:hover:not(.disabled) {
      background: linear-gradient(135deg, rgba(45, 154, 222, 0.5), rgba(45, 154, 222, 0.2));
      border-color: rgba(45, 154, 222, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45, 154, 222, 0.3);

      span {
        color: rgba(238, 248, 253, 1);
      }
    }

    &:active:not(.disabled) {
      transform: translateY(0);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: linear-gradient(135deg, rgba(100, 100, 100, 0.2), rgba(100, 100, 100, 0.1));
      border-color: rgba(150, 150, 150, 0.3);
    }
  }
}
</style>
