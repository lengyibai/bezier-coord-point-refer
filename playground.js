const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let t = 0;
let clickNodes = [];
let bezierNodes = [];
let isPrinted = false;
let isPrinting = false;
let num = 0;
let isDrag = false;
let isDragNode = false;
let dragIndex = 0;
let clickon = 0;
let clickoff = 0;

const getMousePos = (e) => {
  const { left, top } = canvas.getBoundingClientRect();
  return { x: e.clientX - left, y: e.clientY - top };
};

canvas.addEventListener('mousedown', (e) => {
  isDrag = true;
  clickon = Date.now();
  const { x, y } = getMousePos(e);

  clickNodes.forEach((item, index) => {
    if (Math.abs(item.x - x) < 5 && Math.abs(item.y - y) < 5) {
      isDragNode = true;
      dragIndex = index;
    }
  });
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrag || !isDragNode) return;
  const { x, y } = getMousePos(e);
  clickNodes[dragIndex] = { x, y };
  redraw();
});

canvas.addEventListener('mouseup', (e) => {
  isDrag = isDragNode = false;
  clickoff = Date.now();
  if (clickoff - clickon < 200) {
    const { x, y } = getMousePos(e);
    if (!isPrinted && !isDragNode) {
      num++;
      ctx.font = "16px Microsoft YaHei";
      ctx.fillStyle = '#ccc';
      ctx.fillText(`p${ num }`, x, y + 20);
      ctx.fillText(`p${ num }: (${ x }, ${ y })`, 10, num * 20);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      if (clickNodes.length) {
        const { x: startX, y: startY } = clickNodes[clickNodes.length - 1];
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
      }
      clickNodes.push({ x, y });
    }
  }
});

document.getElementById('print').addEventListener('click', () => {
  if (num && !isPrinting) {
    isPrinted = true;
    drawBezier(ctx, clickNodes);
  }
});

document.getElementById('clear').addEventListener('click', () => {
  if (!isPrinting) {
    isPrinted = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clickNodes = [];
    bezierNodes = [];
    t = num = 0;
  }
});

const drawBezier = (ctx, nodes) => {
  if (t > 1) return (isPrinting = false);
  isPrinting = true;
  t += 0.01;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNodes(nodes);
  requestAnimationFrame(() => drawBezier(ctx, nodes));
};

const drawNodes = (nodes) => {
  if (!nodes.length) return;
  const nextNodes = nodes.slice(0, -1).map((_, i) => bezier([nodes[i], nodes[i + 1]], t));

  nodes.forEach(({ x, y }, index) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (nodes.length === num) {
      ctx.font = "16px Microsoft YaHei";
      ctx.fillText(`p${ index + 1 }`, x, y + 20);
      ctx.fillText(`p${ index + 1 }: (${ x }, ${ y })`, 10, (index + 1) * 20);
    }
    if (index) {
      ctx.beginPath();
      ctx.moveTo(nodes[index - 1].x, nodes[index - 1].y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
    }
  });

  if (nodes.length === 1) {
    bezierNodes.push(nodes[0]);
    bezierNodes.slice(1).forEach((obj, i) => {
      ctx.beginPath();
      ctx.moveTo(bezierNodes[i].x, bezierNodes[i].y);
      ctx.lineTo(obj.x, obj.y);
      ctx.strokeStyle = 'red';
      ctx.stroke();
    });
  } else {
    drawNodes(nextNodes);
  }
};

const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));

const bezier = (arr, t) => {
  const n = arr.length - 1;
  return arr.reduce(
    (acc, { x, y }, i) => {
      const coef = factorial(n) / (factorial(i) * factorial(n - i));
      const factor = coef * (1 - t) ** (n - i) * t ** i;
      acc.x += x * factor;
      acc.y += y * factor;
      return acc;
    },
    { x: 0, y: 0 }
  );
};

const getRandomColor = () => `#${ Math.floor(Math.random() * 16777215).toString(16) }`;

const redraw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clickNodes.forEach(({ x, y }, index) => {
    ctx.fillText(`p${ index + 1 }`, x, y + 20);
    ctx.fillText(`p${ index + 1 }: (${ x }, ${ y })`, 10, (index + 1) * 20);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (index) {
      ctx.beginPath();
      ctx.moveTo(clickNodes[index - 1].x, clickNodes[index - 1].y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
    }
  });

  if (isPrinted) {
    const bezierArr = Array.from({ length: 100 }, (_, i) => bezier(clickNodes, i / 100));
    bezierArr.slice(1).forEach((obj, index) => {
      ctx.beginPath();
      ctx.moveTo(bezierArr[index].x, bezierArr[index].y);
      ctx.lineTo(obj.x, obj.y);
      ctx.strokeStyle = 'red';
      ctx.stroke();
    });
  }
};
