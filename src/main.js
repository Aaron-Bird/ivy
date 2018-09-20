import './main.css'

document.addEventListener('DOMContentLoaded', function () {
    let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    let data = {
        freeze: false,
        container: document.querySelector('#sort-view ul'),
        children: document.querySelector('#sort-view ul').getElementsByTagName('li'),
        speed: parseInt(document.querySelector('#speed').value) || 50,
        get length() {
            return this.children.length;
        },

        createData(amount) {
            let container = document.querySelector('#sort-view ul');
            container.innerHTML = '';
            let ulHeight = parseInt(getComputedStyle(container, null).height);
            let ulWidth = parseInt(getComputedStyle(container, null).width);
            let liWidth = ulWidth / amount;
            let liboardRadius = liWidth / 2;

            let colorStart = 'rgb(51,8,103)'.match(/\d+/g).map(Number);
            let colorEnd = 'rgb(48,207,208)'.match(/\d+/g).map(Number);
            let rDifference = (colorEnd[0] - colorStart[0]) / amount;
            let gDifference = (colorEnd[1] - colorStart[1]) / amount;
            let bDifference = (colorEnd[2] - colorStart[2]) / amount;

            let arr = [];
            for (let i = 0; i < amount; i++) {
                let li = document.createElement('li');
                let number = Math.round((ulHeight - liboardRadius) / amount * i + liboardRadius);
                li.number = number;
                li.style.height = number + 'px';
                li.style.width = liWidth + 'px';
                li.style.backgroundColor = `rgb(
                    ${Math.floor(colorStart[0] + rDifference * i)},
                    ${Math.floor(colorStart[1] + gDifference * i)},
                    ${Math.floor(colorStart[2] + bDifference * i)}
                )`;
                arr.push(li);
            }

            arr.sort(_ => 0.5 - Math.random());
            arr.forEach(li => container.appendChild(li));
        },

        async swap(i, j) {
            let container = this.container,
                children = this.children;
            if (i > j) {
                [i, j] = [j, i];
            }
            let elementI = children[i];
            let elementJ = children[j];
            let afterElementOfJ = children[j].nextElementSibling;
            container.insertBefore(elementJ, elementI);
            container.insertBefore(elementI, afterElementOfJ);

            await sleep(this.speed);
        },

        async insert(i, target) {
            let container = this.container,
                children = this.children;
            container.insertBefore(children[i], children[target]);

            await sleep(this.speed);
        },

        async highlight(...args) {
            [...this.children].forEach(element => element.classList.remove('sorting'));
            args.forEach(i => {
                if (i < 0 || i >= this.length) return;
                this.children[i].classList.add('sorting');
            });

            await sleep(this.speed);
        },

        *[Symbol.iterator]() {
            for (let element of this.children) {
                yield element;
            }
        }
    };
    data = new Proxy(data, {
        get(target, propKey, receiver) {
            if (typeof (propKey) !== "symbol" && /^\d+$/.test(propKey)) {
                if (target.freeze) throw 'stop';
                return target.children[propKey].number;
            }
            return Reflect.get(target, propKey, receiver);
        },

    });

    let algorithm = {
        async bubble() {
            for (let i = data.length; i >= 0; i--) {
                let swapped = false;
                for (let j = 0; j < i - 1; j++) {
                    await data.highlight(j, j + 1);

                    if (data[j] > data[j + 1]) {
                        await data.swap(j, j + 1);
                        swapped = true;
                    }
                }
                if (!swapped) return;
            }
        },

        async cocktail() {
            let left = 0,
                right = data.length - 1;
            while (left < right) {
                let swapped = false;
                for (let i = left; i < right; i++) {
                    await data.highlight(i, i + 1);

                    if (data[i] > data[i + 1]) {
                        await data.swap(i, i + 1);
                        swapped = true;
                    }
                }
                right--;

                if (!swapped) return;
                swapped = true;

                for (let i = right; i > left; i--) {
                    await data.highlight(i, i - 1);

                    if (data[i - 1] > data[i]) {
                        await data.swap(i, i - 1);
                        swapped = true;
                    }
                }
                left++;

                if (!swapped) return;
            }
        },

        async selection() {
            let left = 0,
                right = data.length - 1;
            while (left < right) {
                let j = left;
                for (let i = left; i <= right; i++) {
                    if (data[j] > data[i]) {
                        j = i;
                    }

                    await data.highlight(left, i, j);
                }
                if (j) {
                    await data.swap(left, j);
                }
                left++;

                j = right;
                for (let i = right; i >= left; i--) {
                    if (data[i] > data[j]) {
                        j = i;
                    }

                    await data.highlight(right, i, j);
                }
                if (j) {
                    await data.swap(j, right);
                }
                right--;
            }
        },

        async quick(start = 0, end = data.length - 1) {
            let p = start;
            for (let i = start + 1; i <= end; i++) {
                await data.highlight(p, i);

                if (data[i] < data[p]) {
                    await data.insert(i, p);
                    p++;
                }
            }

            if (start < p - 1) {
                await this.quick(start, p - 1);
            }
            if (p < end - 1) {
                await this.quick(p + 1, end);
            }
        },

        async insert() {
            for (let i = 1; i < data.length; i++) {
                let j = i - 1,
                    k = i;
                await data.highlight(j, k);

                while (j >= 0 && data[k] < data[j]) {
                    await data.highlight(j, k);

                    await data.insert(k, j);
                    k = j;
                    j--;
                }
            }
        },

        async gnome() {
            let i = 0;
            while (i < data.length) {
                await data.highlight(i - 1, i);

                if (i === 0 || data[i - 1] < data[i]) {
                    i++;
                } else {
                    console.log(i, i - 1);
                    await data.swap(i - 1, i);
                    i--;
                }
            }
        },

        async shell() {
            let gap = Math.floor(data.length / 2);
            while (gap > 0) {
                for (let i = 0; i < gap; i++) {
                    for (let j = i + gap; j < data.length; j += gap) {
                        let cur = j,
                            pre = j - gap;
                        await data.highlight(pre, cur);

                        while (pre >= 0 && data[pre] > data[cur]) {
                            await data.highlight(pre, cur);

                            await data.swap(cur, pre);
                            cur = pre;
                            pre -= gap;
                        }
                    }
                }
                gap = Math.floor(gap / 2);
            }
        },

        async comb() {
            let gap = Math.floor(data.length * 0.8);
            let swapped = true;
            while (gap > 1 || swapped) {
                if (gap < 1) return;

                swapped = false;
                for (let i = 0; i < data.length - gap; i++) {
                    await data.highlight(i, i + gap);

                    if (data[i] > data[i + gap]) {
                        swapped = true;
                        await data.swap(i, i + gap);
                    }
                }
                gap = Math.floor(gap * 0.8);
            }
        },

        async comb() {
            let gap = Math.floor(data.length * 0.8);
            while (gap >= 1) {
                for (let i = 0; i < data.length - gap; i++) {
                    await data.highlight(i, i + gap);

                    if (data[i] > data[i + gap]) {
                        await data.swap(i, i + gap);
                    }
                }
                gap = Math.floor(gap * 0.8);
            }
        },

        async merge(left = 0, right = data.length - 1) {
            if (left === right) return;

            let middle = left + Math.floor((right - left) / 2);
            await this.merge(left, middle);
            await this.merge(middle + 1, right);

            middle++;
            while (left <= middle && middle <= right) {
                await data.highlight(left, middle);

                if (data[left] > data[middle]) {
                    await data.insert(middle, left);
                    middle++;
                }
                left++;
            }
        },

        async heap() {
            let maxHeap = async (i, length) => {
                let l = 2 * i + 1,
                    r = 2 * i + 2;
                if (l >= length) return;

                let max = (r < length && data[l] <= data[r]) ? r : l;
                await data.highlight(i, max);

                if (data[i] < data[max]) {
                    await data.swap(i, max);
                    await maxHeap(max, length);
                }
            }

            let length = data.length;
            // Create a max heap
            for (let i = Math.floor(length / 2) - 1; i >= 0; i--) {
                await maxHeap(i, length);
            }
            for (let i = length - 1; i >= 0; i--) {
                // Move the maximum number to the end
                await data.swap(0, i);
                // Heap sorting the remaining numbers
                await maxHeap(0, i);
            }
        },

        async bitonic() {
            // Returns the multiple of 2 closest to n
            let getMultipleOfTwo = (n) => {
                let m = 1;
                while (m < n) {
                    m = m << 1;
                }
                return m >> 1;
            };

            let merge = async (start, length, isAscending) => {
                if (length <= 1) return;
                let gap = getMultipleOfTwo(length);

                for (let i = start; i < start + length - gap; i++) {
                    await data.highlight(i, i + gap);
                    // monotonic increasing and data[i] > data[i + gap] 
                    // monotonic decreasing and data[i] < data[i + gap]
                    if (data[i] > data[i + gap] === isAscending) {
                        await data.swap(i, i + gap)
                    }
                }
                await merge(start, gap, isAscending);
                await merge(start + gap, length - gap, isAscending);
            };

            let divide = async (start, length, isAscending) => {
                if (length <= 1) return;
                // when length = 7, the array will be split into
                // [0, 1, 2 , 3] [[4, 5], 6]
                let gap = getMultipleOfTwo(length);
                await divide(start, gap, false);
                await divide(start + gap, length - gap, true);
                await merge(start, length, isAscending);
            };

            await divide(0, data.length, true);
        },

        async sleep() {
            let j = 0;
            let container = data.container;
            // Set a delay to have all 'setTimeout' start at the same time
            let willStartTime = new Date().getTime() + 100;
            for (let i = 0; i < data.length; i++) {
                let element = data.children[i];
                let timeDiff = willStartTime - new Date().getTime();
                setTimeout(_ => {
                    if (data.freeze) return;
                    // Unable to determine index after order change, sorted by element instead of index
                    container.insertBefore(element, data.children[j]);
                    j++;
                }, timeDiff + data[i] * 10);
            }
            // Block the function until all 'setTimeout' is finished
            // But the "stop button" will fail
            await sleep(400 * 10);
        }

    };

    let init = _ => {
        let algorithmButtonList = document.querySelectorAll('.sort');

        let disableAlgorithmButtonList = _ => {
            algorithmButtonList.forEach(algorithmButton => {
                algorithmButton.disabled = true;
                algorithmButton.classList.add('disabled');
            });
        }

        let enableAlgorithmButtonList = _ => {
            algorithmButtonList.forEach(algorithmButton => {
                algorithmButton.disabled = false;
                algorithmButton.classList.remove('disabled');
            });
        }

        data.createData(parseInt(document.querySelector('#amount').value));

        document.querySelectorAll('.sort').forEach(element => {
            element.addEventListener('click', event => {
                disableAlgorithmButtonList();
                var btnName = event.target.id;
                data.freeze = false;
                algorithm[btnName]().then(function (v) {
                    data.highlight();
                }).catch(error => {
                    console.log(error);
                }).finally(_ => {
                    enableAlgorithmButtonList();
                })
            });
        })

        document.querySelector('#stop').addEventListener('click', event => {
            data.freeze = true;
        });

        document.querySelector('#shuffle').addEventListener('click', event => {
            data.freeze = true;
            data.createData(data.length);
        });

        document.querySelector('#speed').addEventListener('input', event => {
            data.speed = parseInt(event.currentTarget.value);
        });

        document.querySelector('#amount').addEventListener('input', event => {
            let length = parseInt(event.currentTarget.value);
            data.createData(length > 800 ? 800 : length);
        });

        (_ => {
            let sign = true,
                delay = 100;
            document.querySelector('#amount').addEventListener('keydown', event => {
                if (sign === false) return;

                if (event.key === 'ArrowUp') {
                    let length = parseInt(event.currentTarget.value) + 50;
                    if (length > 900) length = 900;
                    event.currentTarget.value = length;
                    data.createData(length);

                    sign = false;
                    setTimeout(_ => sign = true, delay);
                } else if (event.key === 'ArrowDown') {
                    let length = parseInt(event.currentTarget.value) - 50;
                    if (length < 0) length = 0;
                    event.currentTarget.value = length;
                    data.createData(length > 900 ? 900 : length);

                    sign = false;
                    setTimeout(_ => sign = true, delay);
                }
            });
        })();

        (_ => {
            let sign = true,
                delay = 10;
            document.querySelector('#speed').addEventListener('keydown', event => {
                if (sign === false) return;

                if (event.key === 'ArrowUp') {
                    let speed = parseInt(event.currentTarget.value) + 5;
                    event.currentTarget.value = speed;
                    data.speed = speed;

                    sign = false;
                    setTimeout(_ => sign = true, delay);
                } else if (event.key === 'ArrowDown') {
                    let speed = parseInt(event.currentTarget.value) - 5;
                    if (speed < 0) speed = 0;
                    event.currentTarget.value = speed;
                    data.speed = speed;

                    sign = false;
                    setTimeout(_ => sign = true, delay);
                }
            });
        })();
    }
    init();
});