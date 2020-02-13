---
layout: post
categories: Android, ConstraintLayout
---



我们项目中大量使用了ConstraintLayout，但是布局绘制效率并不理想，于是针对布局进行了优化。优化过程中发现，ConstraintLayout被设计用来避免嵌套布局，在发生嵌套的时候就会效率非常低。

## 卡顿：ConstraintLayout嵌套导致布局时间过长

在对呱聊进行卡顿优化的时候，我观察到除了主线程进行的处理太多之外（深绿色），另一个问题是Measure非常的耗时（浅绿色）。

<img style="width:300px" src="https://tva1.sinaimg.cn/large/006y8mN6gy1g8vc0qrbr1j30u01o0tsp.jpg" align=center />

于是我就对主线程进行了追踪（trace），结果显示在切换房间的时候，Measure占用超过50%的时间。

![image-20191111164451885](https://tva1.sinaimg.cn/large/006tNbRwgy1g9yroz0gg3j30wu08z0u4.jpg)

进一步探索发现，最慢的地方时其中几层ConstraintLayout嵌套的地方。

![image-20191111165923317](https://tva1.sinaimg.cn/large/006tNbRwgy1g9yrq8048yj31bz04iab2.jpg)

**不起眼的ConstraintLayout的嵌套，对卡顿的贡献如此巨大！**

那为什么ConstraintLayout的嵌套会如此效率低下，官方不是宣称其效率较其他布局更为优越吗？

##  

## ConstraintLayout高效的原理

在谈其高效原理之前，我们要先回顾一下界面绘制的流程。

### android是怎么绘制View的呢？

当一个View聚焦时，绘制又三个步骤：

1. Measure

   由顶向下遍历布局树来决定每个ViewGroup和View应该有多大。当一个ViewGroup被测量时，他的子布局也会被测量。

2. Layout

   再进行一次自顶向下的遍历，每个ViewGroup根据子布局的大小，决定他们的位置

3. Draw

   又进行一次自顶向下的遍历，布局树中的每个对象对应一个Canvas对象，生成一系列绘制指令送到GPU进行渲染。这些指令包含前两部计算所得的，每个布局的大小和位置。

每个步骤都需要一次自顶向下的遍历，所以嵌套层数越多，就需要更久的时间去计算。

### ConstraintLayout：避免遍历绘制

在复杂设计的情况下，其他ViewGroup只能嵌套布局来实现，但是ConstraintLayout单个ViewGroup就可以完成复杂的设计。

**ConstraintLayout通过保持扁平的布局，大幅减少了绘制时三次遍历的深度**，来创造快速、流畅的用户界面。

## ConstraitnLayout低效的原因

### 单个ConstraintLayout的效率低于其他布局

**ConstraintLayout效率优于一组嵌套的复杂布局，那么它是否优于单个布局呢？**

答案是否定的。

#### 与LinearLayout对比实验

![image-20191112112707215](https://tva1.sinaimg.cn/large/006tNbRwgy1g9yrrfml6ij308206m74c.jpg)

![image-20191112112646982](https://tva1.sinaimg.cn/large/006tNbRwgy1g9yrrp94kgj307305wgll.jpg)

尝试进行了对比实验：嵌套LinearLayout和ConstraintLayout这个简单的实验后发现，ConstraintLayout嵌套的渲染耗时几乎是LinearLayout的1.5倍。

对比数据(单位：微秒)

|                  | HandleLaunchActivity() | DoTraveral()    |
| ---------------- | ---------------------- | --------------- |
| LinearLayout     | 280,980(23.29%)        | 219,865(18.22%) |
| ConstraintLayout | 291,215(19.96%)        | 317,013(21.73%) |

这个实验确实是一个极端实验，但是还是可以看出，约束布局的嵌套效率确实不高！

从上述极端对比实验能看出他的效率是低于LinearLayout的。

#### ConstraintLaytout内部实现分析

从内部实现上来看，ConstraintLayout有一些固有的初始化的消耗。其次，ConstraintLayout做了很多优化，这些优化都是有代价的。对于特定布局能完成的任务，ConstraintLayout难以做到比特定布局更优秀。

> Optimizer (***in 1.1***)
>
> In 1.1 we exposed the constraints optimizer. You can decide which optimizations are applied by adding the tag *app:layout_optimizationLevel* to the ConstraintLayout element.
>
> - **none** : no optimizations are applied
> - **standard** : Default. Optimize direct and barrier constraints only
> - **direct** : optimize direct constraints
> - **barrier** : optimize barrier constraints
> - **chain** : optimize chain constraints (experimental)
> - **dimensions** : optimize dimensions measures (experimental), reducing the number of measures of match constraints elements

所以**使用constraintLayout替换所有布局是不理智的**。正确的使用方法应该是替换部分组件（组件原本以复杂的嵌套来进行布局），而不是替换整个屏幕。

### 嵌套会放大单个ConstraintLayout的低效

约束布局的诞生本来就是为了摆脱布局嵌套！一旦发生嵌套，优势就会荡然无存。单个ConstraintLayout的低效，在嵌套的时候就愈加凸显。

显而易见，统一布局文件内避免嵌套是很简单的，那如果引入其他布局文件呢？

#### include引入其他布局文件

当ConstraintLayout内需要引入其他布局文件，**include是可以避免嵌套的**。

如果使用include，可以搭配merge标签和parentTag。这样两个布局文件会被合并为单个ConstraintLayout。

```xml
<android.support.constraint.ConstraintLayout
      android:layout_width="match_parent"
      android:layout_height="match_parent">
  <include
         ...
         layout="@layout/..."
         />
</android.support.constraint.ConstraintLayout>
```

```xml
<merge 
      ...
      tools:parentTag="android.support.constraint.ConstraintLayout">
  ...
  ...
</merge>
```

#### ViewStub无法避免嵌套

但是**ViewStub不能使用merge标签，不可避免的还是会发生嵌套**。所以我们在ConstraintLayout里使用ViewStub的应该多加考虑，一旦膨胀的时候会产生更高的消耗。

##### 谨慎使用ViewStub

对于条件判断可见性的地方，我们大量使用了ViewStub，但根据Track的结果，inflate有时候也是比较费时的。

实际上ViewStub在没有膨胀的时候，是一个**空占位符**，性能优于Visibility.GONE，但是在膨胀的时候依然要为此付出代价。

**如果一开始就需要膨胀的布局，不应该使用ViewStub，应该使用include+merge替代。**一开始就膨胀的布局，膨胀时间仍然在初始化的时候被感知，ViewStub的空占位符的作用完全没有体现出来，反而可能加深了嵌套。

ViewStub的使用场景如：点击后显示布局。这样在初始化的时候绘制时间被缩短，后期特定条件下膨胀时的代价（包括加深嵌套），都是可以接受的。

#### 添加Fragment无法避免嵌套

目前暂未找到相关方法可以在ConstraintLayout里添加Fragment的时候避免嵌套。

考虑到Fragment嵌套过多的情况，需要优化的问题似乎不只是布局卡顿，更是设计问题，所以未进行深入探索。

## ConstraintLayout的正确打开方式

ConstraintLayout是为了解决嵌套太多的问题，但是不是每个地方都适合ConstraintLayout。

1. 如果布局设计比较复杂，使用ConstraintLayout达到扁平化布局确实可以提升效率。

2. 单个布局而言，简单布局效率更高。
   如果某个ConstraintLayout可以替换为某个简单布局，应该使用简单布局。

   如果整个布局过于简单，适当的嵌套不是不可以接受，ConstraintLayout不是必要的。

3. 要注意避免ConstraintLayout互相嵌套。

   例如使用ViewStub的时候就不可避免嵌套，所以是否确实需要在ConstraintLayout里使用ViewStub，还是include+merge标签更加适合，是一个要根据场景多加思考的问题。

_____



### 参考资料

https://android-developers.googleblog.com/2017/08/understanding-performance-benefits-of.html

https://developer.android.com/reference/android/support/constraint/ConstraintLayout#Optimizer

https://www.reddit.com/r/androiddev/comments/a1ijuz/constraint_layout_performance/