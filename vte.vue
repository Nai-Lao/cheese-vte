<template>
  <div>
    <div :style="'width:'+ width">
      <table id="table-th" class="vte-table" width=100% :style="'text-align:' + align">
        <tr v-for="(i,index) in list" :key="index">
          <th :colspan="j.colspanTh" :rowspan="j.rowspan" v-for="(j,key) in i.list" :key="key" v-show="j.isShow"
            :class="j.isThActive?'thActive':''" @click="choose(index,key)" @dblclick="bothDblclickTH(index,key)"
            @contextmenu.prevent="rightClick($event,'th',index,key)">
            <input v-if="j.isThEditor" :ref="'inputfocus'+key" v-model.trim="j.name" @blur="j.isThEditor = false" />
            <div v-else>{{j.name}}</div>
          </th>
        </tr>

        <tr v-for="(i,index) in data" :key="1001+index">
          <td :colspan="j.colspanTh" :rowspan="j.rowspan" v-for="(j,key) in i.data" :key="key" v-show="j.isShow"
            :class="j.isTdActive?'tdActive':''" @click="chooseTD(index,key)" @dblclick="bothDblclickTD(index,key)"
            @contextmenu.prevent="rightClick($event,'td')">
            <input v-if="j.isTdEditor" :ref="'inputfocusTD'+key" :class="'inputfocusTD'+key" v-model.trim="j.value"
              @blur="j.isTdEditor = false" />
            <div v-else>{{j.value}}</div>
          </td>
        </tr>
      </table>
    </div>

    <div class="rightClickBox" v-if="isShowTHRightBox" :style="`top:${y}px;left:${x}px`">
      <ul class="ul" ref="ulRef">
        <li class="li" @click="liClick(1)">添加行表头</li>
        <li class="li" @click="liClick(2)">添加列表头</li>
        <li class="li" @click="liClick(1.1)">删除行表头</li>
        <li class="li" @click="liClick(2.1)">删除列表头</li>
        <li v-show="isShowMerge" class="li" @click="liClick(3)">合并单元格</li>
        <li v-show="isShowSplit" class="li" @click="liClick(4)">拆分单元格</li>
      </ul>
    </div>
    <div class="rightClickBox" v-if="isShowTDRightBox" :style="`top:${y}px;left:${x}px`">
      <ul class="ul" ref="ulRef">
        <li class="li" @click="liClick(1)">添加行内容</li>
        <li class="li" @click="liClick(2)">添加列内容</li>
        <!-- 表格内容暂不做合并 -->
        <!-- <li v-show="isShowMerge" class="li" @click="liClick(3)">合并单元格</li> -->
      </ul>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'vte',
    props: {
      align: {
        type: String,
        default: 'center'
      },
      width: {
        type: [String],
        default: '100%'
      }
    },
    data() {
      return {
        screenWidth: document.body.clientWidth,
        colspanTh: 1,
        tt: true,
        x: 0,
        y: 0,
        list: [
          { list: [{ name: '表头' }, { name: '表头' }, { name: '表头' }, { name: '表头' }] },
        ],
        data: [
          { data: [{ value: '内容' }, { value: '内容' }, { value: '内容' }, { value: '内容' }] },
          { data: [{ value: '内容' }, { value: '内容' }, { value: '内容' }, { value: '内容' }] },
        ],
        isShowTHRightBox: false,
        isShowTDRightBox: false,
        isShowSplit: false,
        chooseList: [], //存储准合并的表头
        chooseListTD: [],//存储准合并的td
        isShowMerge: false, // 是否显示合并单元格按钮
        rightClickType: '',//  右击类型 --- th or td
        spliceTh: { //存储i,j 用来删除
          i: '',
          j: ''
        }
      }
    },
    mounted() {
      this.drag();
      this.getScreenWidth();
      document.addEventListener("click", () => {
        this.isShowTHRightBox = false;
        this.isShowTDRightBox = false;
        this.isShowMerge = false;
        this.isShowSplit = false;
      });
      this.list.forEach(item => {
        item.list.forEach(i => {
          this.$set(i, 'isThEditor', false);
          this.$set(i, 'isThActive', false);
          this.$set(i, 'isShow', true);
          this.$set(i, 'colspanTh', 1);
          this.$set(i, 'rowspan', 1);
        })
      })
      this.data.forEach(item => {
        item.data.forEach(i => {
          this.$set(i, 'isTdEditor', false);
          this.$set(i, 'isTdActive', false);
          this.$set(i, 'isShow', true);
          this.$set(i, 'colspanTh', 1);
          this.$set(i, 'rowspan', 1);
          this.$set(i, 'chooseList', []);
        })
      })
    },
    created() {

    },
    methods: {
      //初始化选中表头
      init() {
        //初始化
        this.list.forEach(item => {
          item.list.forEach(i => {
            i.isThEditor = false;
            i.isThActive = false
          })
        });
        this.chooseList = []
      },
      //表单单击选中
      choose(i, j) {
        let temp;
        this.list[i].list[j].isThActive = !this.list[i].list[j].isThActive;
        if (this.list[i].list[j].isThActive) {
          this.chooseList.push({ i, j })
        } else {  //取消选中时
          let { f1, f2 } = this.getCurrentTh(i, j);
          //确定二维数组2个坐标后，在chooseList中获取下标
          for (let i = 0; i < this.chooseList.length; i++) {
            if (this.chooseList[i].i === f1 && this.chooseList[i].j === f2) {
              temp = i;
              break;
            }
          }
          this.chooseList.splice(temp, 1);
        }
        //只要选中了th或者td其中一个，立马清空另外一个
        this.data.forEach(item => {
          item.data.forEach(i => {
            i.isTdActive = false;
          })
          this.chooseListTD = [];
        })
      },
      //td单击选中  --- 暂时不做td合并
      chooseTD(i, j) {
        console.log(i, j);
        // let temp;
        // this.data[i].data[j].isTdActive = !this.data[i].data[j].isTdActive;
        // if (this.data[i].data[j].isTdActive) {
        //   this.chooseListTD.push({ i, j })
        // } else {  //取消选中时
        //   let { f1, f2 } = this.getCurrentTD(i, j);
        //   //确定二维数组2个坐标后，在chooseList中获取下标
        //   for (let i = 0; i < this.chooseListTD.length; i++) {
        //     if (this.chooseListTD[i].i === f1 && this.chooseListTD[i].j === f2) {
        //       temp = i;
        //       break;
        //     }
        //   }
        //   this.chooseListTD.splice(temp, 1);
        // }
        // this.list.forEach(item => {
        //   item.list.forEach(i => {
        //     i.isThActive = false;
        //   })
        //   this.chooseList = [];
        // })
      },
      //th双击事件
      bothDblclickTH(i, j) {
        this.list[i].list[j].isThEditor = true;
        // this.$refs.inputfocus.focus();
        this.$nextTick(() => {
          let name = 'inputfocus' + j;
          this.$refs[name][0].focus();
        });
      },
      //td 双击事件
      bothDblclickTD(i, j) {
        this.data[i].data[j].isTdEditor = true;
        this.$nextTick(() => {
          let name = 'inputfocusTD' + j;
          this.$refs[name][0].focus();
        });
      },
      //右击事件
      rightClick(e, type, i, j) {
        console.log(this.chooseList);
        this.x = e.pageX;
        this.y = e.pageY;
        this.spliceTh.i = i;
        this.spliceTh.j = j;
        this.rightClickType = type;
        for (let z = 0; z < this.chooseList.length; z++) {
          let item = this.list[this.chooseList[z].i].list[this.chooseList[z].j];
          if (item.colspanTh > 1 || item.rowspan > 1) {
            this.isShowMerge = false;
            this.isShowSplit = true;
            (type === 'th') && (this.isShowTHRightBox = true);
            (type === 'td') && (this.isShowTDRightBox = true);
            return
          }
        }
        if (type === 'th') {
          this.isShowTHRightBox = true;
          if (this.chooseList.length > 1) {
            this.isShowMerge = true;
            this.isShowSplit = false;
          }
        }
        if (type === 'td') {
          this.isShowTDRightBox = true;
          if (this.chooseListTD.length > 1) {
            this.isShowMerge = true;
            this.isShowSplit = false;
          }
        }
      },
      //右击弹窗点击事件
      liClick(index) {
        switch (index) {
          case 1:
            this.addRow();
            break;
          case 1.1:
            this.delRow();
            break;
          case 2.1:
            this.delCol();
            break;
          case 2:
            this.addCol();
            break;
          case 3:
            this.merge()
            this.chooseList = [];
            break;
          case 4:
            this.cellSplit()
            this.chooseList = [];
            break;
          default:
            break;
        }
      },
      //获取当前选择的表头二维数组下标
      getCurrentTh(i, j) {
        let f1, f2;
        //获取二维数组第一个下标
        for (let i = 0; i < this.chooseList.length; i++) {
          if (this.chooseList[i].i === i) {
            f1 = i;
            break;
          }
        }
        //获取二维数组第二个下标
        for (let i = 0; i < this.chooseList.length; i++) {
          if (this.chooseList[i].j === j) {
            f2 = j;
            break;
          }
        }
        return { f1, f2 }
      },
      //获取当前选择的TD二维数组下标
      getCurrentTD(i, j) {
        let f1, f2;
        //获取二维数组第一个下标
        for (let i = 0; i < this.chooseListTD.length; i++) {
          if (this.chooseListTD[i].i === i) {
            f1 = i;
            break;
          }
        }
        //获取二维数组第二个下标
        for (let i = 0; i < this.chooseListTD.length; i++) {
          if (this.chooseListTD[i].j === j) {
            f2 = j;
            break;
          }
        }
        return { f1, f2 }
      },
      //合并单元格
      merge() {
        let iAll = [], jAll = [], tempColspanArr = [], tempRowspanArr = [];
        let colspanMax = 1, rowspanMax = 1;
        let iMin = this.chooseList[0].i, jMin = this.chooseList[0].j, iMax = this.chooseList[0].i, jMax = this.chooseList[0].j;
        for (let z = 0; z < this.chooseList.length; z++) {
          let i = this.chooseList[z].i;
          let j = this.chooseList[z].j;
          iMin = iMin > i ? i : iMin;
          jMin = jMin > j ? j : jMin;
          iMax = iMax < i ? i : iMax;
          jMax = jMax < j ? j : jMax;
          iAll.push(i);
          jAll.push(j)
          tempColspanArr.push(this.list[i].list[j].colspanTh);
          tempRowspanArr.push(this.list[i].list[j].rowspan);
          colspanMax = this.list[i].list[j].colspanTh > colspanMax ? this.list[i].list[j].colspanTh : colspanMax;
          rowspanMax = this.list[i].list[j].rowspan > colspanMax ? this.list[i].list[j].rowspan : rowspanMax;
        }
        //去重转数组
        let iAllSet = Array.from(new Set(iAll));
        let jAllSet = Array.from(new Set(jAll));

        //判断是否存在已经合并的情况
        let isExistMoreRowspan = false;
        let isExistMoreColspan = false;
        let colspanArr = Array.from(new Set(tempColspanArr));
        let rowspanArr = Array.from(new Set(tempRowspanArr));
        isExistMoreRowspan = rowspanArr.length === 1 ? false : true;
        isExistMoreColspan = colspanArr.length === 1 ? false : true;
        //只合并列
        if (iAllSet.length === 1) {
          if (!this.jIsAdjacent(jAll, iMin, jMin, jMax)) {
            this.$message.warning("请选择相邻的2个表头")
            return;
          }
          if (!isExistMoreRowspan) {
            this.mergeColspan(iMin, jMin, tempColspanArr);
          } else {
            this.$message.warning("请选择正确数量的表头在进行合并!")
          }
        }
        //只合并行
        if (jAllSet.length === 1) {
          if (!this.iIsAdjacent(iAll, iMin, iMax, jMin)) {
            this.$message.warning("请选择相邻的2个表头")
            return;
          }
          if (!isExistMoreColspan) {
            this.mergeRow(iMin, iMax, jMin, tempRowspanArr);
          } else {
            this.$message.warning("请选择正确数量的表头在进行合并!")
          }
        }
        //多行多列合并
        if (jAllSet.length !== 1 && iAllSet.length !== 1) {
          if (!isExistMoreColspan && !isExistMoreRowspan) {
            if (colspanArr.length === rowspanArr.length) {
              console.log(1);
              if (this.chooseList.length % 2 === 0) {
                //待优化
                if(!this.colRowAdjacent(iAll, jAll)){
                  this.$message.warning("请选择相邻的表头");
                  return;
                }
                this.mergeColspanRow(iMin, iMax, jMin, jMax);
              } else {
                this.$message.warning("请选择相邻的表头")
              }
            } else {
              this.$message.warning("请选择相邻的表头")
            }
          } else {
            this.mergeColspanRow(iMin, iMax, jMin, jMax);
            if (colspanArr.length === rowspanArr.length) {
              this.mergeColspanRow(iMin, iMax, jMin, jMax);
            } else {
              let ilength = jMax - jMin + 1; //宽
              let jlength = iMax - iMin + 1; // 高
              console.log(jlength, colspanMax, ilength, rowspanMax);
              if (ilength === rowspanMax) {
                if (this.chooseList.length % 2 !== 0) {
                  if (colspanMax === 1) {
                    this.mergeColspanRow(iMin, iMax, jMin, jMax);
                  } else {
                    this.$message.warning("请选择相邻的表头3")
                  }
                }
                this.mergeColspanRow(iMin, iMax, jMin, jMax);
              } else {
                this.$message.warning("请选择正确数量的表头在进行合并!");
              }
            }
          }
        }
        //初始化
        this.init();
      },
      getScreenWidth() {
        const that = this;
        window.addEventListener('resize', () => {
          that.screenWidth = window.screenWidth || document.body.clientWidth;
        }, false);
      },
      //判断是否相邻，限制行合并操作
      iIsAdjacent(iAll, iMin, iMax, jMin) {
        let arr = iAll;
        for (let z = iMin; z <= iMax; z++) {
          if (this.list[z].list[jMin].isShow === false) {
            arr.push(z);
          }
        }
        let flag = true;
        let temp;
        for (let j = 0; j < arr.length - 1; j++) {
          for (let i = 0; i < arr.length - 1 - j; i++) {
            if (arr[i] > arr[i + 1]) {
              let tmpArr;
              tmpArr = arr[i];
              arr[i] = arr[i + 1];
              arr[i + 1] = tmpArr;
            }
          }
        }
        for (let i = 0; i < arr.length - 1; i++) {
          temp = arr[i];
          if (parseInt(temp) + 1 != parseInt(arr[i + 1])) flag = false;
        }
        console.log(arr, 'arr');
        return flag
      },
      //列合并
      mergeColspan(iMin, jMin, tempColspanArr) {
        let temp = jMin;
        let number = 0;
        tempColspanArr.forEach(item => {
          number += item;
        })
        for (let z = 0; z < number; z++) {
          this.list[iMin].list[temp].isShow = false;
          temp++;
        }
        this.list[iMin].list[jMin].colspanTh = number;
        this.list[iMin].list[jMin].name = '表头';
        this.list[iMin].list[jMin].isShow = true;
        this.list[iMin].list[jMin].chooseList = this.chooseList;
      },
      //行合并
      mergeRow(iMin, iMax, jMin, tempRowspanArr) {
        let number = 0;
        tempRowspanArr.forEach(item => {
          number += item;
        })
        for (let z = iMin; z <= iMax; z++) {
          this.list[z].list[jMin].isShow = false;
        }
        this.list[iMin].list[jMin].rowspan = number;
        this.list[iMin].list[jMin].name = '表头';
        this.list[iMin].list[jMin].isShow = true;
        this.list[iMin].list[jMin].chooseList = this.chooseList;
      },
      //多行多列合并
      mergeColspanRow(iMin, iMax, jMin, jMax) {
        let rowspanNumber = iMax - iMin + 1;
        let colspanNumber = jMax - jMin + 1;
        for (let z = iMin; z <= iMax; z++) {
          for (let x = jMin; x <= jMax; x++) {
            this.list[z].list[x].isShow = false;
            this.list[z].list[x].colspanTh = 1;
            this.list[z].list[x].rowspan = 1;
          }
        }
        this.list[iMin].list[jMin].colspanTh = colspanNumber;
        this.list[iMin].list[jMin].rowspan = rowspanNumber;
        this.list[iMin].list[jMin].name = '表头';
        this.list[iMin].list[jMin].isShow = true;
        this.list[iMin].list[jMin].chooseList = this.chooseList;

        // for (let z = 0; z < this.chooseList.length; z++) {
        //   this.list[this.chooseList[z].i].list[this.chooseList[z].j].isShow = false;
        //   this.list[this.chooseList[z].i].list[this.chooseList[z].j].colspanTh = 1;
        //   this.list[this.chooseList[z].i].list[this.chooseList[z].j].rowspan = 1;
        // }
        // this.list[iMin].list[jMin].colspanTh = colspanNumber;
        // this.list[iMin].list[jMin].rowspan = rowspanNumber;
        // this.list[iMin].list[jMin].name = '新表头';
        // this.list[iMin].list[jMin].isShow = true;
      },
      //判断是否相邻，限制列合并操作
      jIsAdjacent(jAll, iMin, jMin, jMax) {
        let arr = jAll;
        for (let z = jMin; z <= jMax; z++) {
          if (this.list[iMin].list[z].isShow === false) {
            arr.push(z);
          }
        }
        let flag = true;
        let temp;
        for (let j = 0; j < arr.length - 1; j++) {
          for (let i = 0; i < arr.length - 1 - j; i++) {
            if (arr[i] > arr[i + 1]) {
              let tmpArr;
              tmpArr = arr[i];
              arr[i] = arr[i + 1];
              arr[i + 1] = tmpArr;
            }
          }
        }
        for (let i = 0; i < arr.length - 1; i++) {
          temp = arr[i];
          if (parseInt(temp) + 1 != parseInt(arr[i + 1])) flag = false;
        }
        return flag
      },
      //判断是否相邻，限制多行多列合并
      colRowAdjacent(iAll, jAll) {
        /***
         * 思路：
         * 1.获取所有的i跟j的数量，并且进行一一对比，当所有的数量都为一致的时候说明是相邻的
         * 
         * （以j为例）
         * 例子：[[0,1],[1,1],[2,1],[2,2]] => 1(3); 2(1)
         * 1 => 3; 2 => 1 // 不相邻
         * 
         * 例子：[[0,1],[1,1],[0,2],[1,2]] => 1(2); 2(2)
         * 1 => 2; 2 => 2 // 相邻
         * 
         * **/
        //计算出每个i和j出现的次数 --- 返回的是一个对象
        let countedJ = jAll.reduce((obj, name) => {
          if (name in obj) {
            obj[name]++
          } else {
            obj[name] = 1
          }
          return obj
        }, {})
        let countedI = iAll.reduce((obj, name) => {
          if (name in obj) {
            obj[name]++
          } else {
            obj[name] = 1
          }
          return obj
        }, {})
        let tempJ = [],tempI = [];
        //将得到的i和j数量进行转数组
        for(let j in countedJ){
          tempJ.push(countedJ[j])
        }
        for(let i in countedI){
          tempI.push(countedI[i])
        }
        //去重i和j的数组去重
        let setTempJ = Array.from(new Set(tempJ))
        let setTempI = Array.from(new Set(tempI))
        //去重后的i和j长度只要一个大于0的话，那么就不是相邻的表头
        if(setTempJ.length>1 || setTempI.length>1){
          return false;
        }
        return true;
      },
      //拆分单元格
      cellSplit() {
        let iMin = 0, jMin = 0, iMax = 0, jMax = 0;
        let TiMin = 0, TjMin = 0, TiMax = 0, TjMax = 0;
        for (let z = 0; z < this.chooseList.length; z++) {
          let i = this.chooseList[z].i;
          let j = this.chooseList[z].j;
          iMin = iMin > i ? i : iMin;
          jMin = jMin > j ? j : jMin;
          iMax = iMax < i ? i : iMax;
          jMax = jMax < j ? j : jMax;
          console.log(this.list[i].list[j], '****', i, j);
          if (this.list[i].list[j].chooseList) {
            for (let z = 0; z < this.list[i].list[j].chooseList.length; z++) {
              let a = this.list[i].list[j].chooseList[z].i;
              let s = this.list[i].list[j].chooseList[z].j;
              TiMin = TiMin > a ? a : TiMin;
              TjMin = TjMin > s ? s : TjMin;
              TiMax = TiMax < a ? a : TiMax;
              TjMax = TjMax < s ? s : TjMax;
            }
            for (let z = TiMin; z <= TiMax; z++) {
              for (let x = TjMin; x <= TjMax; x++) {
                this.list[z].list[x].isShow = true;
                this.list[z].list[x].colspanTh = 1;
                this.list[z].list[x].rowspan = 1;
                console.log(TiMax, TjMax);
              }
            }
          }
        }
        /**
        
        **/
        //初始化
        this.init();
      },
      //获取表格内容
      getTabData() {
        return { list: this.list, data: this.data };
      },
      //添加行
      addRow() {
        let list = [];
        let name = this.rightClickType === 'th' ? 'list' : 'data';
        for (let i = 0; i < this[name][0][name].length; i++) {
          let tempList = Object.assign({}, this[name][0][name][i]);
          tempList.isThEditor = false;
          tempList.isThActive = false;
          tempList.isShow = true;
          tempList.colspanTh = 1;
          tempList.rowspan = 1;
          tempList.chooseList = [];
          list.push(tempList)
        }
        if (this.rightClickType === 'th') this[name].push({ list: list });
        if (this.rightClickType === 'td') this[name].push({ data: list });
      },
      addCol() {
        let list = [];
        let name = this.rightClickType === 'th' ? 'list' : 'data';
        for (let i in this.list) {
          this.list[i].list.push({ name: '表头', isThEditor: false, isThActive: false, isShow: true, colspanTh: 1, rowspan: 1, chooseList: [] })
        }
        for (let i in this.data) {
          this.data[i].data.push({ value: '内容', isTdEditor: false, isTdActive: false, isShow: true, colspanTh: 1, rowspan: 1 })
        }
      },
      //删除行
      delRow() {
        if (this.list.length === 1) {
          this.$message.warning("最少要有一个表头")
          return;
        }
        let i = this.list.length;
        let isTopDel = false;  // 删除的行是否是合并的第一个
        for (let z = 0; z < this.list[this.spliceTh.i].list.length; z++) {
          if (this.list[this.spliceTh.i].list[z].rowspan > 1) {
            isTopDel = true;
          }
        }
        for (let z = 0; z < i; z++) {
          for (let x = 0; x < this.list[z].list.length; x++) {
            if (this.list[z].list[x].rowspan > 1) {
              this.list[z].list[x].rowspan = this.list[z].list[x].rowspan - 1;
            } else {
              isTopDel && (this.list[z].list[x].isShow = true)
            }
          }
        }
        this.list.splice(this.spliceTh.i, 1);
      },
      //删除列
      delCol() {
        if (this.list[0].list.length === 1 || this.list[this.spliceTh.i].list[this.spliceTh.j].colspanTh === this.list[0].list.length) {
          this.$message.warning("最少要有一个表头")
          return;
        }
        // 存在列合并的情况下，删除，会将合并的列以及内容全部删除
        this.data.forEach(i => {
          i.data.splice(this.spliceTh.j, this.list[this.spliceTh.i].list[this.spliceTh.j].colspanTh);
        })
        this.list.forEach(i => {
          i.list.splice(this.spliceTh.j, this.list[this.spliceTh.i].list[this.spliceTh.j].colspanTh);
        })
      },
      //表头拖动
      drag() {
        let tTD; //用来存储当前更改宽度的Table Cell,避免快速移动鼠标的问题
        let table = document.querySelector("#table-th");
        for (let j = 0; j < table.rows[0].cells.length; j++) {
          table.rows[0].cells[j].onmousedown = function () {
            //记录单元格
            tTD = this;
            if (event.offsetX > tTD.offsetWidth - 10) {
              tTD.mouseDown = true;
              tTD.oldX = event.x;
              tTD.oldWidth = tTD.offsetWidth;
            }
            //记录Table宽度
            // table = tTD; while (table.tagName != 'TABLE') table = table.parentElement;
            // tTD.tableWidth = table.offsetWidth;
          };
          table.rows[0].cells[j].onmouseup = function () {
            //结束宽度调整
            if (tTD == undefined) tTD = this;
            tTD.mouseDown = false;
            tTD.style.cursor = 'default';
          };
          table.rows[0].cells[j].onmousemove = function () {
            //更改鼠标样式
            if (event.offsetX > this.offsetWidth - 10)
              this.style.cursor = 'col-resize';
            else
              this.style.cursor = 'default';
            //取出暂存的Table Cell
            if (tTD == undefined) tTD = this;
            //调整宽度
            if (tTD.mouseDown != null && tTD.mouseDown == true) {
              tTD.style.cursor = 'default';
              if (tTD.oldWidth + (event.x - tTD.oldX) > 0)
                tTD.width = tTD.oldWidth + (event.x - tTD.oldX);
              //调整列宽
              tTD.style.width = tTD.width;
              tTD.style.cursor = 'col-resize';
              //调整该列中的每个Cell
              table = tTD;
              while (table.tagName != 'TABLE') table = table.parentElement;
              for (let j = 0; j < table.rows.length; j++) {
                table.rows[j].cells[tTD.cellIndex].width = tTD.width;
              }
            }
          };
        }
      }

    },
  }
</script>

<style scoped>
  .vte-table,
  .vte-table tr th,
  .vte-table tr td {
    border-collapse: collapse;
    padding: 0;
  }

  .vte-table tr td {
    border: 1px solid #ebeef5;
    height: 23px;
    line-height: 23px;
    font-size: 12px;
  }

  .vte-table tr th {
    background: #f5f7fa;
    border: 1px solid #ebeef5;
    height: 23px;
    line-height: 23px;
    font-size: 12px;
    color: #909399;
    font-weight: 600;
  }

  .vte-table {
    /* border-collapse: collapse; */
    position: relative;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
  }

  .rightClickBox {
    background-color: #fff;
    border: 1px solid #eee;
    width: 100px;
    text-align: center;
    position: absolute;
  }

  .ul {
    list-style-type: none;
    font-size: 12px;
  }

  .li {
    padding: 5px 0;
  }

  .li:hover {
    cursor: pointer;
    background-color: rgb(28, 106, 196);
    color: #fff;
  }

  .thActive {
    border: 1px solid #eee !important;
    background-color: rgb(28, 106, 196) !important;
    color: #fff !important;
  }

  .tdActive {
    border: 1px solid rgb(241, 248, 255) !important;
    background-color: rgb(241, 248, 255) !important;
  }
</style>