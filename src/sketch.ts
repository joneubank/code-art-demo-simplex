import {
  Color,
  Gradient,
  grid,
  GridTile,
  Noise,
  Vec2,
} from '@code-not-art/core';
// import { repeat } from '@code-not-art/core/dist/utils';
import {
  Sketch,
  SketchProps,
  Params,
  Parameter,
  Config,
  FrameData,
} from '@code-not-art/sketch';

const config = Config({
  menuDelay: 0,
});

const params: Parameter[] = [
  Params.header('Grid Settings'),
  Params.range('dotFill', 0.41, [0.1, 1]),
  Params.range('gridWidth', 49, [15, 80, 1]),

  Params.header('Noise Settings'),
  Params.range('detail', 0.067, [0.001, 0.2, 0.0001]),
  Params.range('updateSpeed', 500, [0, 1000, 5]),

  Params.header('Image Fill'),
  Params.range('drawThreshold', 0.61),
  Params.range('edgeFade', 2.4, [0.1, 5, 0.1]),
];

const init = ({ data }: SketchProps) => {
  data.valueTime = 0;
};

const draw = ({ params, canvas, palette, data, rng }: SketchProps) => {
  const gridWidth = params.gridWidth as number;
  data.grid = rng.shuffle(
    grid({
      columns: gridWidth / 2,
      rows: gridWidth, //Math.round(canvas.get.height() / canvas.get.width()) * gridWidth,
      size: canvas.get.size(),
    }),
  );

  data.gradient = new Gradient(
    palette.colors[0],
    palette.colors[0],
    palette.colors[1],
    palette.colors[2],
    palette.colors[3],
  );
};

const loop = (
  { canvas, data, palette, params, rng }: SketchProps,
  { frameTime }: FrameData,
): boolean => {
  canvas.fill('black');
  const frequency = params.detail as number;
  const noiseSpeed = params.updateSpeed as number;
  const gridWidth = params.gridWidth as number;
  const dotFill = params.dotFill as number;
  const drawThreshold = params.drawThreshold as number;
  const edgeFade = params.edgeFade as number;

  const simplex = Noise.simplex3(rng.int(0, 10000000), {
    frequency: (frequency / gridWidth) * 50,
    octaves: [0, 1, 2],
  });

  data.valueTime += noiseSpeed === 0 ? 0 : frameTime / (1001 - noiseSpeed);

  (<GridTile[]>data.grid).forEach((tile) => {
    const { row, column } = tile;
    const value = (simplex(row + 1, column + 1, data.valueTime) + 1) / 2;

    const alphaPow = 5.1 - edgeFade;
    const alphaMax = Math.pow(gridWidth / 2, alphaPow);
    const alpha =
      ((alphaMax - Math.pow(Math.abs(row + 0.5 - gridWidth / 2), alphaPow)) /
        alphaMax +
        (alphaMax -
          Math.pow(Math.abs(column + 0.5 - gridWidth / 2), alphaPow)) /
          alphaMax) /
      2;

    if (value < drawThreshold) {
      const drawValue = value / alpha / drawThreshold;
      const fill = new Color({
        h: (<Gradient>data.gradient).at(drawValue).get.hsv().h,
        s: (drawValue * 100) / drawThreshold,
        v: ((1 - drawValue) * 100) / drawThreshold,
        a: 1,
      });
      // canvas.draw.rect({
      //   point: origin,
      //   height: size.y + 1,
      //   width: size.x + 1,
      //   fill,
      // });
      canvas.draw.circle({
        origin: tile.center.scale(new Vec2(0.5, 1)),
        radius: (tile.size.x * dotFill * alpha * 2) / 2,
        fill,
      });
      canvas.draw.circle({
        origin: new Vec2(canvas.get.width(), 0).diff(
          tile.center.scale(new Vec2(0.5, -1)),
        ),
        radius: (tile.size.x * dotFill * alpha * 2) / 2,
        fill,
      });
    }
  });
  return false;
};

// const reset = ({}: SketchProps) => {};

export default Sketch({
  config,
  params,
  init,
  draw,
  loop,
  // reset,
});
