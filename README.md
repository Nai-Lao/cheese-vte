# vte2

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 安装命令
```
npm install --save cheese-vte
```

### 组件引用
安装完成组件依赖后，在main.js里面需要引用以下2个路径
import cheeseVte from 'cheese-vte'
import 'cheese-vte/dist/cheese-vte.css'
Vue.use(cheeseVte)

### 组件说明
cheese-vte 是一个多表头可编辑的组件，采用了Excel的合并方式，进行多级表头的设置，是一个可视化编辑的表格;
cheese-vte 的发展路线是将Excel代入到table表格中;
目前该组件只是一个初级版本，暂时只支持表头的合并、拆封、自定义表头;
后续会对将表头的操作事件同步到表格内容，及一些简单的公式操作;
cheese-vte 目前还是处于发阶段，可能会存在一些bug，希望大家可以反馈。如果有什么好的想法的话，可以进行留言。
