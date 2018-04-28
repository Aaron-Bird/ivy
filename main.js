window.onload = function() {
    // author: Zach Saucier
    // source: https://graphicdesign.stackexchange.com/questions/83866/generating-a-series-of-colors-between-two-colors
    function interpolateColor(color1, color2, factor) {
        if (arguments.length < 3) {
            factor = 0.5;
        }
        var result = color1.slice();
        for (var i = 0; i < 3; i++) {
            result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
        }
        return result;
    };

    function interpolateColors(color1, color2, steps) {
        var stepFactor = 1 / (steps - 1),
            interpolatedColorArray = [];

        color1 = color1.match(/\d+/g).map(Number);
        color2 = color2.match(/\d+/g).map(Number);
        for (var i = 0; i < steps; i++) {
            interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));
        }
        return interpolatedColorArray;
    }
    // end

    var arr;
    var isSort = false;
    container = document.querySelector('#sort-view ul');

    function createChild(amount) {
        function _random(start, end) {
            start = (start !== undefined) ? parseFloat(start) : 5;
            end = (end !== undefined) ? parseFloat(end) : 400;
            var num = Math.floor(Math.random() * (end - start + 1) + start);
            return num;
        }

        function _addColor() {
            var tarr = Array.from(arr);
            tarr.sort(function(x, y) {
                return x.number - y.number;
            });
            var colorList = interpolateColors("rgb(51,8,103)", "rgb(48,207,208)", amount);
            for (var i = 0, j = 0; i < arr.length; i++) {
                if (i === 0 || tarr[i].number !== tarr[i - 1].number) {
                    var color = `rgba(${colorList[j][0]}, ${colorList[j][1]}, ${colorList[j][2]}, 1)`;
                    j++;
                }
                tarr[i].style.backgroundColor = color;
            }
        }

        arr = [];
        container.innerHTML = '';
        for (var i = 0; i < amount; i++) {
            var li = document.createElement('li');
            var num = _random();
            li.number = num;
            li.style.height = num + 'px';
            container.appendChild(li);
            arr.push(li);
        }
        _addColor();
    }

    function refresh() {
        container.innerHTML = '';
        arr.forEach(i => container.appendChild(i));
    }

    async function addHeightLight() {
        arr.forEach(i => i.classList.remove('sorting'));
        for (var i = 0; i < arguments.length; i++) {
            arr[arguments[i]].classList.add('sorting');
        }
        refresh();
        await sleep(10);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function swap(x, y) {
        // arr.forEach(i => i.className = '');
        arr[x].classList.add('move');
        arr[y].classList.add('move');
        await sleep(10);

        var temp = arr[x];
        arr[x] = arr[y];
        arr[y] = temp;
        refresh();

        // await sleep(10); 
        arr[x].classList.remove('move');
        arr[y].classList.remove('move');
    }

    async function insert(currPos, insePos) {
        var temp = arr[currPos];
        temp.classList.add('move');
        await sleep(10);

        arr.splice(currPos, 1);
        arr.splice(insePos, 0, temp);

        // await sleep(10); 
        temp.classList.remove('move');
    }

    async function bubbleSort() {
        for (var i = arr.length; i >= 0; i--) {
            for (var j = 0; j < i - 1; j++) {
                if (arr[j].number > arr[j + 1].number) {
                    await swap(j, j + 1);
                }
                await addHeightLight(j, j + 1);
            }
        }
    }

    async function cocktailSort() {
        var i = 0,
            left = 0,
            right = arr.length - 1;
        while (left < right) {
            for (var i = left; i < right; i++) {
                if (arr[i].number > arr[i + 1].number) {
                    await swap(i, i + 1);
                }
                await addHeightLight(i, i + 1);
            }
            right--;
            for (var i = right; i > left; i--) {
                if (arr[i - 1].number > arr[i].number) {
                    await swap(i, i - 1);
                }
                await addHeightLight(i, i + 1);
            }
            left++;
        }
    }

    async function selectionSort() {
        var i = null,
            j = null,
            left = 0,
            right = arr.length - 1;
        while (left < right) {
            j = left;
            for (i = left; i <= right; i++) {
                if (arr[j].number > arr[i].number) {
                    j = i;
                }
                await addHeightLight(left, i);
            }
            if (j) {
                await swap(left, j);
            }
            left++;

            j = right;
            for (i = right; i >= left; i--) {
                if (arr[i].number > arr[j].number) {
                    j = i;
                }

                await addHeightLight(right, i);
            }
            if (j) {
                await swap(j, right);
            }
            right--;
        }

    }

    async function quickSort(start, end) {
        var p = start;
        for (var i = start + 1; i <= end; i++) {
            if (arr[i].number < arr[p].number) {
                await addHeightLight(p, i);
                await insert(i, start);
                p++;
            }
            await addHeightLight(p, i);
        }

        if (start < p - 1) {
            await quickSort(start, p - 1);
        }
        if (p < end - 1) {
            await quickSort(p + 1, end);
        }
    }

    async function insertSort() {
        for (var i = 1; i < arr.length; i++) {
            var j = i - 1;
            var k = i;
            while (j >= 0 && arr[k].number < arr[j].number) {
                await addHeightLight(j, k);
                await insert(k, j);
                k = j;
                j--;
            }
        }
        await addHeightLight(j, k);
    }

    async function shellSort() {
        var gap = Math.floor(arr.length / 2);
        while (gap > 0) {
            for (var i = 0; i < gap; i++) {
                for (var j = i + gap; j < arr.length; j += gap) {
                    var cur = j;
                    var pre = j - gap;
                    while (pre >= 0 && arr[pre].number > arr[cur].number) {
                        await addHeightLight(pre, cur);
                        await swap(cur, pre);
                        cur = pre;
                        pre -= gap;
                    }
                }
            }
            console.log(gap)
            gap = Math.floor(gap / 2);
        }
    }

    function init() {
        var btnList = document.querySelectorAll('.sort-btn');

        function _disBtn() {
            for (var i = 0; i < btnList.length; i++) {
                btnList[i].disabled = true;
                btnList[i].classList.add('disabled');
            }
        }

        function _ableBtn() {
            for (var i = 0; i < btnList.length; i++) {
                btnList[i].disabled = false;
                btnList[i].classList.remove('disabled');
            }
        }

        createChild(50);
        document.querySelector('.btns').onclick = function(event) {
            if (isSort) createChild(50);
            _disBtn();
            var btnName = event.target.id;
            console.log(btnName)
            switch (btnName) {
                case "bubble":
                    bubbleSort().then(function(v) {
                        addHeightLight();
                        _ableBtn();
                    });
                    break;
                case "cocktail":
                    cocktailSort().then(function(v) {
                        addHeightLight();
                        _ableBtn();
                    });
                    break;
                case "selection":
                    selectionSort().then(function(v) {
                        addHeightLight();
                        _ableBtn();
                    });
                    break;
                case "quick":
                    quickSort(0, arr.length - 1).then(function(v) {
                        addHeightLight();
                        _ableBtn();
                    });
                    break;
                case "insert":
                    insertSort().then(function(v) {
                        addHeightLight();
                        _ableBtn();
                    });
                    break;
                case "shell":
                    shellSort().then(function(v) {
                        addHeightLight();
                        _ableBtn();
                    });
                    break;
            }
            isSort = true;
        }
    }
    init();
}