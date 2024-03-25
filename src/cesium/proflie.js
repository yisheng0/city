

import * as Cesium from "cesium";
import * as echarts from 'echarts';
let heights = [];
let distances = [];
let dSum = [];
export function profile(viewer) {

    let positions = [] // 记录位置
    let points = []
    let poly = null // 记录线
    let cartesian = null // 获取鼠标与地图的交点
    let labelPt // 最终位置
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    // 鼠标左键点击事件
    handler.setInputAction(function (ele) {
        // 创建射线并获取交点
        let ray = viewer.camera.getPickRay(ele.position)
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        let ellipsoid = viewer.scene.globe.ellipsoid; // 获取椭球体
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian, ellipsoid);
        if (!Cesium.defined(cartesian)) return
        if (positions.length === 0) {
            positions.push(cartesian.clone())
        }
        if (positions.length > 2) {
            getDH(positions, viewer)
        }
        positions.push(cartesian)
        points.push(cartesian)
        // 记录鼠标单击时的位置，异步计算贴地距离
        labelPt = positions[positions.length - 1]
        //在三维场景中添加圆点
        viewer.entities.add({
            name: '_range',
            position: labelPt,
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
            },
        });

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    // 鼠标移动事件
    handler.setInputAction(function (ele) {
        let ray = viewer.camera.getPickRay(ele.endPosition)
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        // 判断是否定义该对象
        if (!Cesium.defined(cartesian)) {
            return
        }
        if (positions.length >= 2) {
            if (!Cesium.defined(poly)) {
                // 移动时路径绘制
                poly = new PolyLinePrimitive(positions)
            } else {
                positions.pop()
                positions.push(cartesian)
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(function (ele) {
        // 创建射线并获取交点
        let ray = viewer.camera.getPickRay(ele.position);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!Cesium.defined(cartesian))
            return;
        if (positions.length === 0) {
            positions.push(cartesian.clone());
        }
        if (positions.length > 2) {
            getDH(positions, viewer);
        }
        setTimeout(() => {
            // 打印 heights 和 distances 数组，查看结果
            // console.log(heights,heights.length);
            // console.log(distances,distances.length);
            dSum = sumArr(distances)
            dSum.unshift(0)
            // console.log(dSum,dSum.length) 
            let dataDH = [];
            for (let i = 0; i < dSum.length; i++) {
                dataDH[i] = [dSum[i], heights[i]]
            }
            //  console.log(dataDH)
            let divE = document.createElement("divE")
            divE.id = 'echarts'

            // 创建一个 button 元素
            let button = document.createElement('button');
            button.textContent = '关闭'
            button.style.cssText = `
               z-index: 3;
               font-size: bold;
               position: absolute;
            `

            let container = document.createElement("div");
            container.id = "container";

            container.appendChild(divE);
            container.appendChild(button)
            document.body.appendChild(container);
            container.style.cssText = divE.style.cssText = `
                        width: 400px; 
                        height: 355px;
                        pointer-events: auto;
                        position: fixed;
                        right: 0;
                        top: 45vh
                        `
            // 为 button 添加点击事件监听器，当点击时移除 div 元素
            button.addEventListener('click', function () {
                var parent = container.parentNode;
                if (parent) {
                    parent.removeChild(container);
                }
            });

            // 存储鼠标按下时的位置
            let mouseDownPos = { x: 0, y: 0 };
            // 存储div元素的初始位置
            let divPos = { x: 0, y: 0 };
            let buttonOffset = { x: 0, y: 0 };
            // 表示是否正在拖拽
            let isDragging = false;
            container.addEventListener('mousedown',
                function down(event) {
                    // 设置正在拖拽为true
                    isDragging = true;
                    // 获取鼠标按下时的位置
                    mouseDownPos.x = event.clientX;
                    mouseDownPos.y = event.clientY;
                    // 获取div元素的初始位置
                    divPos.x = divE.offsetLeft;
                    divPos.y = divE.offsetTop;
                    buttonOffset.x = button.offsetLeft - divE.offsetLeft;
                    buttonOffset.y = button.offsetTop - divE.offsetTop;
                })
            container.addEventListener("mousemove",
                function move(event) {
                    // 如果正在拖拽
                    if (isDragging) {
                        // 计算鼠标移动的距离
                        var dx = event.clientX - mouseDownPos.x;
                        var dy = event.clientY - mouseDownPos.y;
                        // 设置div元素的新位置
                        divE.style.left = divPos.x + dx + "px";
                        divE.style.top = divPos.y + dy + "px";
                        button.style.left = divE.offsetLeft + buttonOffset.x + "px";
                        button.style.top = divE.offsetTop + buttonOffset.y + "px";
                    }
                    // 获取浏览器屏幕的宽度和高度
                    var screenWidth = window.innerWidth;
                    var screenHeight = window.innerHeight;
                    // 获取div元素的宽度和高度
                    var divWidth = divE.offsetWidth;
                    var divHeight = divE.offsetHeight;
                    // 判断div元素是否超出屏幕边界，如果是，就调整位置
                    if (divE.offsetLeft < 0) {
                        divE.style.left = "0px";
                    }
                    if (divE.offsetLeft + divWidth > screenWidth) {
                        divE.style.left = screenWidth - divWidth + "px";
                    }
                    if (divE.offsetTop < 0) {
                        divE.style.top = "0px";
                    }
                    if (divE.offsetTop + divHeight > screenHeight) {
                        divE.style.top = screenHeight - divHeight + "px";
                    }
                })
            container.addEventListener('mouseup',
                function up() {
                    // 设置正在拖拽为false
                    isDragging = false;
                }
            )



            let myChart = echarts.init(document.getElementById('echarts'), 'dark');
            let options = {
                visualMap: [
                    {
                        show: false,
                        type: 'continuous',
                        seriesIndex: 0,
                        min: 0,
                        max: 19
                    },
                ],
                title: {
                    text: '——剖面分析'
                },
                xAxis: {
                    type: 'value',
                    name: "距离（米）"
                },
                yAxis: {
                    type: 'value',
                    name: "高度（米）"
                },
                series: [
                    {
                        data: dataDH,
                        type: 'line',
                        smooth: true,
                        symbol: 'none'
                    }
                ]

            }
            // 绘制图表
            myChart.setOption(options);
        }, 1000);

        positions.push(cartesian);

        points.push(cartesian)
        // 记录鼠标单击时的节点位置，异步计算贴地距离
        labelPt = positions[positions.length - 2];
        // 在三维场景中添加Label
        viewer.entities.add({
            name: '_range',
            position: labelPt,
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.MINTCREAM,
                outlineWidth: 2,
            }
        });
        handler.destroy(); // 删除事件
        handler = undefined;


    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    class PolyLinePrimitive {
        constructor(positions) {
            // 定义多段线的属性
            this.options = {
                name: "_range",
                // 多段线的名称
                polyline: {
                    show: true, // 多段线是否可见
                    positions: [],// 多段线的位置    
                    material: Cesium.Color.CORNFLOWERBLUE,  // 多段线的颜色 
                    width: 3, // 多段线的宽度 
                    clampToGround: true // 多段线是否贴合地形 
                }
            };
            this.positions = positions; // 保存位置数组 
            this.init(); // 调用初始化方法
        }

        // 初始化方法，用来创建和添加多段线实体
        init() {
            // 定义一个更新函数，用来返回多段线的位置
            let update = () => {
                return this.positions;
            };
            // 使用CallbackProperty来动态更新多段线的位置
            this.options.polyline.positions = new Cesium.CallbackProperty(update, false);
            // 把多段线实体添加到Viewer对象中
            viewer.entities.add(this.options);
        }
    }
}

function getDH(positions, viewer) {
    let i = positions.length - 3
    var poin1 = new Cesium.Cartographic.fromCartesian(positions[i]);
    var poin2 = new Cesium.Cartographic.fromCartesian(positions[i + 1]);
    // 创建一个椭球测地线对象
    var geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(poin1, poin2);

    // 计算两点之间的表面距离
    var s = geodesic.surfaceDistance;

    // 定义一个数组，用于存储分割后的点
    var cartoPts = [poin1];

    // 按照表面距离，将两点之间的线段分割成若干个小段，每段长度为 1000 米
    for (let i = 100; i < s; i += 100) {
        var cartoPt = geodesic.interpolateUsingSurfaceDistance(i);
        cartoPts.push(cartoPt);
    }

    // 将最后一个点也加入数组中
    cartoPts.push(poin2);


    // 对数组中的点进行地形采样，获取每个点的高程信息
    var promise = Cesium.sampleTerrain(viewer.terrainProvider, 2, cartoPts);

    // 使用 promise 格式
    promise.then(function (updatedPositions) {
        // 遍历数组中的每个点，将其高度存入 heights 数组中
        for (let i = 0; i < updatedPositions.length; i++) {
            let h1 = viewer.scene.globe.getHeight(updatedPositions[i])
            // console.log(h1);
            let h = Number(h1)
            // console.log(h)
            heights.push(h);
        }

        // 遍历数组中的相邻两点，计算它们之间的实际距离（考虑地形高度），将其存入 distances 数组中
        for (let i = 0; i < updatedPositions.length - 1; i++) {
            var geoD = new Cesium.EllipsoidGeodesic();
            geoD.setEndPoints(updatedPositions[i], updatedPositions[i + 1]);
            var innerS = geoD.surfaceDistance;
            innerS = Math.sqrt(
                Math.pow(innerS, 2) +
                Math.pow(
                    updatedPositions[i + 1].height - updatedPositions[i].height,
                    2
                )
            );
            let inner = Number(innerS.toFixed(2))
            distances.push(inner);
        }
    });
}
function sumArr(arr) {
    let newArr = [];
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
        newArr[i] = sum;
    }
    return newArr;
}