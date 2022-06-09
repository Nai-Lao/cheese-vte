# cheese-vte

### 组件描述

**cheese-vte** vte表示的是基于vue开发的table组件包含了Excel的简略功能;  
**cheese-vte** 是一个多表头可编辑的组件，采用了Excel的合并方式，进行多级表头的设置，是一个可视化编辑的表格;  
**cheese-vte** 的发展路线是将Excel常用简单功能代入到table表格中;

### 目录

- [cheese-vte](#cheese-vte)
    - [组件描述](#组件描述)
    - [目录](#目录)
    - [演示地址](#演示地址)
    - [更新日志](#更新日志)
    - [安装依赖](#安装依赖)
    - [项目启动](#项目启动)
    - [打包npm包](#打包npm包)
    - [安装命令](#安装命令)
    - [组件使用](#组件使用)
    - [发展](#发展)
    - [文档](#文档)
      - [属性](#属性)
      - [方法](#方法)

### 演示地址

[演示地址](https://www.bilibili.com/video/BV1rr4y1x7Dr/)

### 更新日志

<div>
    <div style="font-weight: bold;">v0.0.1-alpha:</div>
    1.新增了删除列跟行的功能;<br />
    2.新增了表头拖动操作宽度的功能;<br />
    3.优化了表头合并算法,大大的减少了非相邻表头还能进行合并的bug;<br />
    4.暂时取消了表格内容合并功能;<br />
</div>

### 安装依赖

```
npm install
```

### 项目启动

```
npm run serve
```

### 打包npm包

```
npm run npm-build
```

### 安装命令

```
npm install --save cheese-vte
```

### 组件使用

安装完成组件依赖后，在main.js里面需要引用以下2个路径

```javascript
main.js
import cheeseVte from 'cheese-vte'
import 'cheese-vte/dist/cheese-vte.css'
Vue.use(cheeseVte)

app.vue
<vte></vte>
```

### 发展

目前该组件只是一个初级版本，暂时只支持表头的合并、拆封、自定义表头;  
后续会对将表头的操作事件同步到表格内容，及一些简单的公式操作;  
cheese-vte 目前还是处于开发阶段，会不断的更新迭代，目前存在一些bug，希望大家可以反馈。如果有什么好的想法的话，可以进行留言。  

### 文档

#### 属性

<table>
    <tr>
        <th>参数</th>
        <th>说明</th>
        <th>类型</th>
        <th>可选值</th>
        <th>默认值</th>
    </tr>
    <tr>
        <td>align</td>
        <td>对齐方式</td>
        <td>String</td>
        <td>left/center/right</td>
        <td>center</td>
    </tr>
 </table>

#### 方法

 <table>
    <tr>
        <th>方法名</th>
        <th>说明</th>
        <th>类型</th>
        <th>返回参数</th>
    </tr>
    <tr>
        <td>getTabData</td>
        <td>返回一个Object对象的表格数据内容;list:表头,data:表格内容;对齐方式</td>
        <td>Object</td>
        <td>{list,data}</td>
    </tr>
 </table>
