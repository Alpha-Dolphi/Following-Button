const btn = document.querySelector(".cool-btn");
const spins = document.querySelectorAll(".spin");
const wrapper = document.querySelector(".wrapper");

class FollowingButton {
    #prevTime = 0;
    #slowingRatio = 0.5;
    #saturationValue = 0;
    #x = 0;
    #y = 0;

    #buttonSpeed = 10;
    #animation;

    constructor() {
        this.initializeEventListeners();
        this.moveButton = this.moveButton.bind(this);
    }

    initializeEventListeners() {
        wrapper.addEventListener("pointerenter", () => {
            wrapper.addEventListener("pointermove", this.moveButton);
        });
        
        wrapper.addEventListener("pointerleave", (e) => {
            wrapper.removeEventListener("pointermove", this.moveButton);
            if (this.#animation) {
                cancelAnimationFrame(this.#animation);
                this.#animation = null;
            }
            this.moveButton(e, true);
            spins.forEach(spin => (spin.style.background = "#2b292d"));
            this.#saturationValue = 0;
        });
        
        btn.addEventListener("click", () => {
            this.#saturationValue += 20;
            const newColor = `hsl(8, ${this.#saturationValue}%, 50%)`;
        
            spins.forEach((spin) => {
                spin.style.background = newColor;
            });
        });
    }

    debounce(isReturning) {
        if (Date.now() - this.#prevTime < 5 && !isReturning) {
            this.#prevTime = Date.now();
            return true;
        }
        this.#prevTime = Date.now();
        return false;
    }

    moveButton(e, isReturning = false) {
        if (this.debounce(isReturning)) {
            return;
        }

        const { distanceX, distanceY, increaseX, increaseY } = this.calculateData(e, isReturning);

        this.cancelAnimation();

        this.updateButtonPosition(
            increaseX,
            increaseY,
            distanceX,
            distanceY,
            isReturning
        );
    }

    calculateData(e, isReturning) {
        const { clientX, clientY } = e;
        const bounding = wrapper.getBoundingClientRect();
        const width = wrapper.clientWidth;
        const height = wrapper.clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const pointerX = clientX - bounding.x;
        const pointerY = clientY - bounding.y;
        const buttonX = centerX + this.#x;
        const buttonY = centerY + this.#y;

        let distanceX, distanceY;

        if (isReturning) {
            distanceX = centerX - buttonX;
            distanceY = centerY - buttonY;
            this.#buttonSpeed = 20;
        } else {
            distanceX = pointerX - buttonX;
            distanceY = pointerY - buttonY;
            this.#buttonSpeed = 12;
        }

        const increaseX = distanceX / this.#buttonSpeed;
        const increaseY = distanceY / this.#buttonSpeed;

        return { distanceX, distanceY, increaseX, increaseY };
    }

    updateButtonPosition(increaseX, increaseY, distanceX, distanceY, isReturning) {
        const x = this.#x * this.#slowingRatio;
        const y = this.#y * this.#slowingRatio;

        btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        this.#x += increaseX;
        this.#y += increaseY;

        if (this.continueMoving(distanceX, distanceY, isReturning)) {
            this.#animation = requestAnimationFrame(() =>
                this.updateButtonPosition(increaseX, increaseY, distanceX, distanceY, isReturning)
            );
        } else {
            this.cancelAnimation();
        }
    }

    continueMoving(distanceX, distanceY, isReturning) {
        if (isReturning && !Math.round(this.#x) && !Math.round(this.#y)) {
            return false;
        }
        return (
            Math.abs(this.#x) < Math.abs(distanceX) || Math.abs(this.#y) < Math.abs(distanceY)
        );
    }

    cancelAnimation() {
        if (this.#animation) {
            cancelAnimationFrame(this.#animation);
            this.#animation = null;
        }
    }
}

new FollowingButton();