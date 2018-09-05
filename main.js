document.addEventListener('DOMContentLoaded', function () {

    let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    let createData = amount => {
        let container = document.querySelector('#sort-view ul');
        container.innerHTML = '';
        let ulHeight = parseInt(getComputedStyle(container, null).height);

        let colorStart = 'rgb(51,8,103)'.match(/\d+/g).map(Number);
        let colorEnd = 'rgb(48,207,208)'.match(/\d+/g).map(Number);
        let rDifference = (colorEnd[0] - colorStart[0]) / amount;
        let gDifference = (colorEnd[1] - colorStart[1]) / amount;
        let bDifference = (colorEnd[2] - colorStart[2]) / amount;

        let arr = [];
        for (let i = 0; i < amount; i++) {
            let li = document.createElement('li');
            let number = (ulHeight - 10) / amount * i + 10;
            li.number = number;
            li.style.height = number + 'px';

            li.style.backgroundColor = `rgba(
                ${Math.floor(colorStart[0] + rDifference * i)},
                ${Math.floor(colorStart[1] + gDifference * i)},
                ${Math.floor(colorStart[2] + bDifference * i)},
                1
            )`;
            arr.push(li);
        }

        arr.sort(_ => 0.5 - Math.random());
        arr.forEach(li => container.appendChild(li));
    }

    let data = {
        container: document.querySelector('#sort-view ul'),
        children: document.querySelector('#sort-view ul').getElementsByTagName('li'),
        get length() {
            return this.children.length;
        },

        async swap(i, j) {
            let container = this.container,
                children = this.children;
            if (i > j) {
                [i, j] = [j, i];
            }
            elementI = children[i];
            elementJ = children[j];
            afterElementOfJ = children[j].nextElementSibling;
            container.insertBefore(elementJ, elementI);
            container.insertBefore(elementI, afterElementOfJ);

            await sleep(20);
        },

        async insert(i, target) {
            let container = this.container,
                children = this.children;
            container.insertBefore(children[i], children[target]);

            await sleep(20);
        },

        async highlight(...args) {
            [...this.children].forEach(element => element.classList.remove('sorting'));
            args.forEach(i => this.children[i].classList.add('sorting'));

            await sleep(20);
        }
    };
    let stop = false;
    data = new Proxy(data, {
        get(target, propKey, receiver) {
            if (stop) throw 'stop';
            if (/^\d+$/.test(propKey)) {
                return target.children[propKey];
            }
            return Reflect.get(target, propKey, receiver);
        },

        set(target, propKey, value, receiver) {
            if (stop) throw 'stop';
            return Reflect.set(target, propKey, value, receiver);
        }
    });

    let algorithm = {
        async bubble() {
            for (let i = data.length; i >= 0; i--) {
                for (let j = 0; j < i - 1; j++) {
                    await data.highlight(j, j + 1);

                    if (data[j].number > data[j + 1].number) {
                        await data.swap(j, j + 1);
                    }
                }
            }
        },

        async cocktail() {
            let left = 0,
                right = data.length - 1;
            while (left < right) {
                for (let i = left; i < right; i++) {
                    await data.highlight(i, i + 1);

                    if (data[i].number > data[i + 1].number) {
                        await data.swap(i, i + 1);
                    }

                }
                right--;
                for (let i = right; i > left; i--) {
                    await data.highlight(i, i - 1);

                    if (data[i - 1].number > data[i].number) {
                        await data.swap(i, i - 1);
                    }
                }
                left++;
            }
        },

        async selection() {
            let left = 0,
                right = data.length - 1;
            while (left < right) {
                let j = left;
                for (let i = left; i <= right; i++) {
                    if (data[j].number > data[i].number) {
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
                    if (data[i].number > data[j].number) {
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

                if (data[i].number < data[p].number) {
                    await data.insert(i, start);
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

                while (j >= 0 && data[k].number < data[j].number) {
                    await data.highlight(j, k);

                    await data.insert(k, j);
                    k = j;
                    j--;
                }
            }
            // await data.highlight(j, k);
        },

        async shell() {
            let gap = Math.floor(data.length / 2);
            while (gap > 0) {
                for (let i = 0; i < gap; i++) {
                    for (let j = i + gap; j < data.length; j += gap) {
                        let cur = j,
                            pre = j - gap;
                        await data.highlight(pre, cur);

                        while (pre >= 0 && data[pre].number > data[cur].number) {
                            await data.highlight(pre, cur);

                            await data.swap(cur, pre);
                            cur = pre;
                            pre -= gap;
                        }
                    }
                }
                gap = Math.floor(gap / 2);
            }
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

        createData(50);

        document.querySelectorAll('.sort').forEach(element => {
            element.addEventListener('click', event => {
                disableAlgorithmButtonList();
                var btnName = event.target.id;
                stop = false;
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
            stop = true;
        });

        document.querySelector('#random').addEventListener('click', event => {
            stop = true;
            createData(50);
        });
    }
    init();
});