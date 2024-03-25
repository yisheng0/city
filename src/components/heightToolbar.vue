<template>
    <div id="toolbar">
        <table>
            <tbody>
                <tr>
                    <td>背景透明度</td>
                    <td>
                        <input type="range" min="0.0" max="1.0" step="0.01"
                            data-bind="value: backgroundTransparency, valueUpdate: 'input'">
                    </td>
                </tr>
                <tr>
                    <td>条带透明度</td>
                    <td>
                        <input type="range" min="0.0" max="1.0" step="0.01"
                            data-bind="value: bandTransparency, valueUpdate: 'input'">
                    </td>
                </tr>
                <tr>
                    <td>条带宽度</td>
                    <td>
                        <input type="range" min="10" max="1000" step="1"
                            data-bind="value: bandThickness, valueUpdate: 'input'">
                    </td>
                </tr>
                <tr>
                    <td>条带1</td>
                    <td>
                        <input type="range" min="4000" max="8848" step="1"
                            data-bind="value: band1Position, valueUpdate: 'input'">
                    </td>
                </tr>
                <tr>
                    <td>条带1</td>
                    <td>
                        <input type="range" min="4000" max="8848" step="1"
                            data-bind="value: band2Position, valueUpdate: 'input'">
                    </td>
                </tr>
                <tr>
                    <td>条带3</td>
                    <td>
                        <input type="range" min="4000" max="8848" step="1"
                            data-bind="value: band3Position, valueUpdate: 'input'">
                    </td>
                </tr>
                <tr>
                    <td>梯度</td>
                    <td>
                        <input type="checkbox" data-bind="checked: gradient">
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script setup>
import { ref } from "vue"
import * as Cesium from "cesium";
// const props = defineProps({
//     viewer: {
//         type: Object,
//         required: true
//     }
// })
// console.log(props.viewer)
// console.log(window.viewer)
let viewer = ref();
viewer = window.viewer
setTimeout(() => {
    Cesium.knockout.track(viewModel);
    const toolbar = document.getElementById("toolbar");
    Cesium.knockout.applyBindings(viewModel, toolbar);
    for (const name in viewModel) {
        if (viewModel.hasOwnProperty(name)) {
            Cesium.knockout
                .getObservable(viewModel, name)
                .subscribe(updateMaterial);
        }
    }
    updateMaterial(viewer);
}, 800)

const viewModel = {
    gradient: false,
    band1Position: 7000.0,
    band2Position: 7500.0,
    band3Position: 8000.0,
    bandThickness: 100.0,
    bandTransparency: 0.5,
    backgroundTransparency: 0.75,
};
function updateMaterial() {
    const gradient = Boolean(viewModel.gradient);
    const band1Position = Number(viewModel.band1Position);
    const band2Position = Number(viewModel.band2Position);
    const band3Position = Number(viewModel.band3Position);
    const bandThickness = Number(viewModel.bandThickness);
    const bandTransparency = Number(viewModel.bandTransparency);
    const backgroundTransparency = Number(
        viewModel.backgroundTransparency
    );

    const layers = [];
    const backgroundLayer = {
        entries: [
            {
                height: 4200.0,
                color: new Cesium.Color(0.0, 0.0, 0.2, backgroundTransparency),
            },
            {
                height: 8000.0,
                color: new Cesium.Color(1.0, 1.0, 1.0, backgroundTransparency),
            },
            {
                height: 8500.0,
                color: new Cesium.Color(1.0, 0.0, 0.0, backgroundTransparency),
            },
        ],
        extendDownwards: true,
        extendUpwards: true,
    };
    layers.push(backgroundLayer);

    const gridStartHeight = 4200.0;
    const gridEndHeight = 8848.0;
    const gridCount = 50;
    for (let i = 0; i < gridCount; i++) {
        const lerper = i / (gridCount - 1);
        const heightBelow = Cesium.Math.lerp(
            gridStartHeight,
            gridEndHeight,
            lerper
        );
        const heightAbove = heightBelow + 10.0;
        const alpha =
            Cesium.Math.lerp(0.2, 0.4, lerper) * backgroundTransparency;
        layers.push({
            entries: [
                {
                    height: heightBelow,
                    color: new Cesium.Color(1.0, 1.0, 1.0, alpha),
                },
                {
                    height: heightAbove,
                    color: new Cesium.Color(1.0, 1.0, 1.0, alpha),
                },
            ],
        });
    }
    const antialias = Math.min(10.0, bandThickness * 0.1);
    if (!gradient) {
        const band1 = {
            entries: [
                {
                    height: band1Position - bandThickness * 0.5 - antialias,
                    color: new Cesium.Color(0.0, 0.0, 1.0, 0.0),
                },
                {
                    height: band1Position - bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                },
                {
                    height: band1Position + bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                },
                {
                    height: band1Position + bandThickness * 0.5 + antialias,
                    color: new Cesium.Color(0.0, 0.0, 1.0, 0.0),
                },
            ],
        };

        const band2 = {
            entries: [
                {
                    height: band2Position - bandThickness * 0.5 - antialias,
                    color: new Cesium.Color(0.0, 1.0, 0.0, 0.0),
                },
                {
                    height: band2Position - bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                },
                {
                    height: band2Position + bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                },
                {
                    height: band2Position + bandThickness * 0.5 + antialias,
                    color: new Cesium.Color(0.0, 1.0, 0.0, 0.0),
                },
            ],
        };

        const band3 = {
            entries: [
                {
                    height: band3Position - bandThickness * 0.5 - antialias,
                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.0),
                },
                {
                    height: band3Position - bandThickness * 0.5,
                    color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                },
                {
                    height: band3Position + bandThickness * 0.5,
                    color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                },
                {
                    height: band3Position + bandThickness * 0.5 + antialias,
                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.0),
                },
            ],
        };

        layers.push(band1);
        layers.push(band2);
        layers.push(band3);
    } else {
        const combinedBand = {
            entries: [
                {
                    height: band1Position - bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                },
                {
                    height: band2Position,
                    color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                },
                {
                    height: band3Position + bandThickness * 0.5,
                    color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                },
            ],
        };

        layers.push(combinedBand);
    }

    const material = Cesium.createElevationBandMaterial({
        scene: viewer.scene,
        layers: layers,
    });
    viewer.scene.globe.material = material;
}


</script>

<style>
#toolbar {
    position: fixed;
    top: 40vh;
    height: 269px;
    width: 300px;
    display: flex;
    justify-content: space-around;
    color: white;
    background-color: #242543;
}
</style>