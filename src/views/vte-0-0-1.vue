<template>
  <div style="width: 100%;">
    <div style="width:90%;margin: 10px auto;">
      <table class="vex-table" width=100%>
        <tr v-for="(i,index) in list" :key="index">
          <th :colspan="j.colspanTh" :rowspan="j.rowspan" v-for="(j,key) in i.list" :key="key"
            :class="j.isThActive?'thActive':''" @click="choose(index,key)" @dblclick="bothDblclick(index,key)"
            @contextmenu.prevent="rightClick($event,index,key)">
            <input v-if="j.isThEditor" :ref="'inputfocus'+key" v-model.trim="j.name" @blur="j.isThEditor = false" />
            <div v-else>{{j.name}}</div>
          </th>
        </tr>


        <tr>
          <td v-for="(item,index) in data" :key="index">{{item}}</td>
        </tr>
      </table>
    </div>

    <div class="rightClickBox" v-if="isShowRightBox" :style="`top:${y}px;left:${x}px`">
      <ul class="ul" ref="ulRef">
        <li class="li" @click="liClick(1)">添加行表头</li>
        <li class="li" @click="liClick(2)">添加列表头</li>
        <li v-show="isShowMerge" class="li" @click="liClick(3)">合并单元格</li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'vte',
    data() {
      return {
        screenWidth: document.body.clientWidth,
        colspanTh: 1,
        tt: true,
        width: 60,
        x: 0,
        y: 0,
        list: [
          { list: [{ name: '表头1' }, { name: '表头2' }, { name: '表头3' }, { name: '表头4' }] },
        ],
        data: [1, 2, 3, 4],
        isShowRightBox: false,
        isThEditor: false,
        chooseList: [], //存储准合并的表头
        isShowMerge: false, // 是否显示合并单元格按钮
      }
    },
    mounted() {
      this.getScreenWidth();
      document.addEventListener("click", () => {
        this.isShowRightBox = false;
        this.isShowMerge = false;
      });

      this.list.forEach(item => {
        item.list.forEach(i => {
          this.$set(i, 'isThEditor', false);
          this.$set(i, 'isThActive', false);
          this.$set(i, 'colspanTh', 1);
          this.$set(i, 'rowspan', 1);
        })
      })
      console.log(this.list);
    },
    created() {

    },
    methods: {
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
      },
      //表头双击事件
      bothDblclick(i, j) {
        this.list[i].list[j].isThEditor = true;
        // this.$refs.inputfocus.focus();
        this.$nextTick(() => {
          let name = 'inputfocus' + j;
          this.$refs[name][0].focus();
        });
      },
      //右击事件
      rightClick(e, i, j) {
        // console.log(e, i, j);
        let temp;
        this.x = e.pageX;
        this.y = e.pageY;
        this.isShowRightBox = true;
        let { f1, f2 } = this.getCurrentTh(i, j);
        //判断当前右击的表头是否选中
        for (let i = 0; i < this.chooseList.length; i++) {
          if (this.chooseList[i].i === f1 && this.chooseList[i].j === f2) {
            temp = i;
            break;
          }
        }
        console.log(temp);
        if (this.chooseList.length > 1) {
          this.isShowMerge = true;
        }
      },
      //右击弹窗点击事件
      liClick(index) {
        let list = []
        switch (index) {
          case 1:
            for (let i = 0; i < this.list[0].list.length; i++) {
              let tempList = Object.assign({}, this.list[0].list[i]);
              tempList.isThEditor = false;
              tempList.isThActive = false;
              tempList.colspanTh = 1;
              list.push(tempList)
            }
            this.list.push(
              { list: list }
            )
            break;
          case 2:
            for (let i in this.list) {
              this.list[i].list.push({ name: '表头' + (this.list[i].list.length + 1), isThEditor: false, isThActive: false })
              this.data.push(this.data.length + 1)
            }
            break;
          case 3:
            this.merge()
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
      //合并单元格
      merge() {
        let i, j, iMin = this.chooseList[0].i, jMin = this.chooseList[0].j, iMax = this.chooseList[0].i, jMax = this.chooseList[0].j;
        let tempColspanArr = [], rowspanArr = []; //存储选中合并列的colspanTh 和 rowspan 属性
        let allI = [], allJ = [];  //存储所有的i,j 用来判断到底是合并行还是列
        let iType, jType;  //合并类型
        for (let z = 0; z < this.chooseList.length; z++) {
          i = this.chooseList[z].i;
          j = this.chooseList[z].j;
          // console.log(i, j);
          //获取最大值与最小值
          iMin = iMin > i ? i : iMin;
          jMin = jMin > j ? j : jMin;
          iMax = iMax < i ? i : iMax;
          jMax = jMax < j ? j : jMax;
          tempColspanArr.push(this.list[i].list[j].colspanTh)
          rowspanArr.push(this.list[i].list[j].rowspan)
          allI.push(i);
          allJ.push(j);
        }
        // console.log(iMax, jMax);
        //列合并判断
        for (let z = 1; z < allI.length; z++) {
          if (allI[0] === allI[z]) {
            iType = 'i';
          } else {
            iType = '';
            //只要存在一次不一样就不是列的合并
            break;
          }
        }
        //行合并判断
        for (let z = 1; z < allJ.length; z++) {
          console.log(allJ[0], allJ[z], 'allJ[j]');
          if (allJ[0] === allJ[z]) {
            jType = 'j';
          } else {
            jType = '';
            //只要存在一次不一样就不是行的合并
            break;
          }
        }



        console.log(iType, jType, '&&&');
        if (iType) {
          console.log("合并列");
          this.mergeColumn(i, iMin, jMin, tempColspanArr)
        }
        if (jType) {
          console.log("合并行");
          this.mergeRow(allJ, iMin, jMin, iMax, rowspanArr, 1)
        } else if (!iType) {
          console.log("合并行吧应该是");
          this.mergeRow(allJ, iMin, jMin, iMax, rowspanArr, 2)
        }


        //合并完成后，清空临时存储的数组
        this.chooseList = [];
      },
      getScreenWidth() {
        const that = this;
        window.addEventListener('resize', () => {
          that.screenWidth = window.screenWidth || document.body.clientWidth;
        }, false);
      },
      //合并列
      mergeColumn(i, iMin, jMin, tempColspanArr) {
        //合并列
        this.list[iMin].list.splice(jMin, this.chooseList.length, { name: '新表头', isThEditor: false, isThActive: false })
        let tempColspan = 0;
        //合并单元格，赋值新的colspanTh
        tempColspanArr.forEach(item => {
          tempColspan += item;
        })
        this.list[i].list[jMin].colspanTh = tempColspan;
      },
      //合并行  state:状态，1 => 行长度相同的情况下下；2 => 行长度不相同的情况下
      mergeRow(allJ, iMin, jMin, iMax, rowspanArr, state) {
        if (state === 1) {
          console.log('长度相同', jMin);
          let rowspanMax;
          //获取rowspan的值，进行来判断
          for (let z = 0; z < rowspanArr.length; z++) {
            if (rowspanArr[z] > '1') {
              rowspanMax = rowspanArr[z];
              break;
            } else {
              rowspanMax = 1;
            }
          }
          if (rowspanMax === 1) {
            for (let z = iMin; z < iMax + 1; z++) {
              this.list[z].list.splice(jMin, 1);
            }
            this.list[iMin].list.splice(jMin, 0, { name: '新表头', isThEditor: false, isThActive: false });
          } else {
            this.list[iMin].list.splice(jMin, 1);
            this.list[rowspanMax - iMin].list.splice(rowspanMax, 1);
            this.list[iMin].list.splice(jMin, 0, { name: '新表头', isThEditor: false, isThActive: false });
          }
          let tempRowspan = 0;
          //合并单元格，赋值新的colspanTh
          rowspanArr.forEach(item => {
            tempRowspan += item;
          })
          this.list[iMin].list[jMin].rowspan = tempRowspan;
        } else if (state === 2) {
          let rowspanMax;
          let minLength = this.list[iMin].list.length, maxLength = 0, tempLengthArr = [], every, minLengthIndex = 0, maxLengthIndex = 0;
          //获取J的最大长度跟最小长度
          for (let z = iMin; z < iMax + 1; z++) {
            console.log(this.list[z].list.length, '长度', jMin);
            // minLength = minLength > this.list[z].list.length ? this.list[z].list.length : minLength;
            // maxLength = maxLength < this.list[z].list.length ? this.list[z].list.length : maxLength;
            if (minLength > this.list[z].list.length) {
              minLength = this.list[z].list.length;
              minLengthIndex = z;
            }
            if (maxLength < this.list[z].list.length) {
              maxLength = this.list[z].list.length;
              maxLengthIndex = z;
            }
            tempLengthArr.push(this.list[z].list.length)
          }
          let setTempLengthArr = new Set(tempLengthArr);
          console.log(setTempLengthArr.length, 'setTempLengthArr', maxLengthIndex, minLengthIndex);
          every = maxLength - minLength;//获取最大值跟最小值的差
          for (let z = 0; z < rowspanArr.length; z++) {
            if (rowspanArr[z] > '1') {
              rowspanMax = rowspanArr[z];
              break;
            } else {
              rowspanMax = 1;
            }
          }
          if (rowspanMax === 1) {
            for (let z = iMin; z < iMax + 1; z++) {
              if (z === iMin) {
                this.list[z].list.splice(jMin, 1);
              } else {
                this.list[z].list.splice(jMin + every, 1);
              }
              // this.list[z].list.splice(jMin + every, 1);
            }
            if (maxLengthIndex > minLengthIndex) {
              this.list[iMin].list.splice(jMin, 0, { name: '新表头', isThEditor: false, isThActive: false });
              let tempRowspan = 0;
              //合并单元格，赋值新的colspanTh
              rowspanArr.forEach(item => {
                tempRowspan += item;
              })
              this.list[iMin].list[jMin].rowspan = tempRowspan;
            } else {
              this.list[iMin].list.splice(jMin + every, 0, { name: '新表头123', isThEditor: false, isThActive: false });
              let tempRowspan = 0;
              //合并单元格，赋值新的colspanTh
              rowspanArr.forEach(item => {
                tempRowspan += item;
              })
              this.list[iMin].list[jMin + every].rowspan = tempRowspan;
            }
            // this.list[iMin].list.splice(jMin, 0, { name: '新表头',isThEditor: false, isThActive: false });
          } else {
            this.list[iMin].list.splice(jMin + every, 1);
            this.list[rowspanMax - iMin].list.splice(rowspanMax, 1);
            this.list[iMin].list.splice(jMin + every, 0, { name: '新表头', isThEditor: false, isThActive: false });
            let tempRowspan = 0;
            //合并单元格，赋值新的colspanTh
            rowspanArr.forEach(item => {
              tempRowspan += item;
            })
            this.list[iMin].list[jMin].rowspan = tempRowspan;
          }
          // let tempRowspan = 0;
          // //合并单元格，赋值新的colspanTh
          // rowspanArr.forEach(item => {
          //   tempRowspan += item;
          // })
          // this.list[iMin].list[jMin].rowspan = tempRowspan;
        }
      }
    },
  }
</script>

<style scoped>
  .vex-table,
  .vex-table tr th,
  .vex-table tr td {
    border: 1px solid #ccc;
  }

  .vex-table tr th {
    background-color: rgb(232, 231, 227);
  }

  .vex-table {
    border-collapse: collapse;
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
    border: 1px solid rgb(28, 106, 196) !important;
  }
</style>