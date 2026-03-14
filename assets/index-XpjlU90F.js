(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class LottoWebInputView {
  constructor() {
    this.moneyInput = document.querySelector("#money");
    this.purchaseForm = document.querySelector("#purchase-form");
    this.winningInputs = document.querySelectorAll(
      ".winning-input-group .winning-input"
    );
    this.bonusInput = document.querySelector("#bonus-number");
    this.submitButton = document.querySelector("#submit");
    this.closeButton = document.querySelector("#close");
    this.restartButton = document.querySelector("#restart");
  }
  bindPurchase(handler) {
    this.purchaseForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handler();
    });
  }
  bindSubmit(handler) {
    this.submitButton.addEventListener("click", handler);
  }
  bindCloseModal(handler) {
    this.closeButton.addEventListener("click", handler);
  }
  bindRestart(handler) {
    this.restartButton.addEventListener("click", handler);
  }
  reset() {
    this.moneyInput.value = "";
    this.winningInputs.forEach((input) => {
      input.value = "";
    });
    this.bonusInput.value = "";
  }
  getPurchaseMoney() {
    return Number(this.moneyInput.value);
  }
  getWinningNumbers() {
    return [...this.winningInputs].map((input) => input.value).join(",");
  }
  getBonusNumber() {
    return Number(this.bonusInput.value);
  }
}
class LottoWebOutputView {
  constructor() {
    this.lottoList = document.querySelector(".lotto-list");
    this.lottoCount = document.querySelector("#lotto-count");
    this.moneyError = document.querySelector("#money-error");
    this.winningBonusError = document.querySelector("#winning-bonus-error");
    this.modal = document.querySelector(".modal");
    this.profitText = document.querySelector("#profit");
    this.fifthCount = document.querySelector("#fifth-count");
    this.fourthCount = document.querySelector("#fourth-count");
    this.thirdCount = document.querySelector("#third-count");
    this.secondCount = document.querySelector("#second-count");
    this.firstCount = document.querySelector("#first-count");
    this.lottoSection = document.querySelector(".lotto-section");
    this.winningInputSection = document.querySelector(
      ".winning-bonus-input-section"
    );
    this.submitButton = document.querySelector("#submit");
  }
  renderLottoCount(count) {
    this.lottoCount.textContent = `총 ${count}개를 구매했습니다.`;
  }
  renderLottos(lottos) {
    this.lottoList.innerHTML = lottos.map(
      (lotto) => `
        <li class="text-body">
          <span class="lotto-image">🎟️</span>
          ${lotto.getNumbers().join(", ")}
        </li>
      `
    ).join("");
  }
  showModal() {
    this.modal.classList.remove("hidden");
  }
  hideModal() {
    this.modal.classList.add("hidden");
  }
  renderResult(result) {
    this.fifthCount.textContent = `${result.FIFTH}개`;
    this.fourthCount.textContent = `${result.FOURTH}개`;
    this.thirdCount.textContent = `${result.THIRD}개`;
    this.secondCount.textContent = `${result.SECOND}개`;
    this.firstCount.textContent = `${result.FIRST}개`;
  }
  renderProfit(profit) {
    this.profitText.textContent = `총 수익률은 ${profit}%입니다.`;
  }
  showMoneyError(message) {
    this.moneyError.textContent = message;
    this.moneyError.classList.remove("hidden");
  }
  clearMoneyError() {
    this.moneyError.textContent = "";
    this.moneyError.classList.add("hidden");
  }
  showWinningBonusError(message) {
    this.winningBonusError.textContent = message;
    this.winningBonusError.classList.remove("hidden");
  }
  clearWinningBonusError() {
    this.winningBonusError.textContent = "";
    this.winningBonusError.classList.add("hidden");
  }
  showPurchaseSection() {
    this.lottoSection.classList.remove("hidden");
    this.winningInputSection.classList.remove("hidden");
    this.submitButton.classList.remove("hidden");
  }
  hidePurchaseSection() {
    this.lottoSection.classList.add("hidden");
    this.winningInputSection.classList.add("hidden");
    this.submitButton.classList.add("hidden");
  }
}
const PRIZE = {
  FIRST: 2e9,
  SECOND: 3e7,
  THIRD: 15e5,
  FOURTH: 5e4,
  FIFTH: 5e3
};
const MONEY_UNIT = 1e3;
const LOTTO_RANGE = {
  MAX: 45,
  MIN: 1,
  COUNT: 6
};
const ERROR_MESSAGE = {
  PURCHASE_MONEY: {
    MIN: "[ERROR] 구입 금액은 1000원 이상입니다.",
    NUMBER: "[ERROR] 구입 금액은 숫자만 입력해야 합니다.",
    UNIT: "[ERROR] 구입 금액은 1000원 단위입니다."
  },
  WINNING_NUMBER: {
    LENGTH: "[ERROR] 당첨 번호는 6개이어야 합니다.",
    COMMA: "[ERROR] 콤마(,) 사이에 숫자를 입력해야 합니다.",
    RANGE: "[ERROR] 당첨 번호는 1 ~ 45 사이어야 합니다.",
    REGEX: "[ERROR] 당첨 번호 구분은 콤마(,) 입니다.",
    DUPLICATE: "[ERROR] 당첨 번호가 중복입니다."
  },
  BONUS_NUMBER: {
    RANGE: "[ERROR] 보너스 번호는 1 ~ 45 사이어야 합니다.",
    NUMBER: "[ERROR] 숫자를 입력해야 합니다.",
    DUPLICATE: "[ERROR] 당첨 번호랑 중복입니다."
  },
  RETRY: {
    INVALID: "[ERROR] 다시 입력해주세요."
  }
};
const RETRY_ANSWER = {
  YES: ["y", "Y"],
  NO: ["n", "N"]
};
function checkNumberRange(winningNumberArray) {
  const booleanArray = winningNumberArray.map((element) => {
    return getBooleanNumberRange(element);
  });
  return booleanArray;
}
function getBooleanNumberRange(element) {
  if (element < LOTTO_RANGE.MIN || element > LOTTO_RANGE.MAX) return false;
  return true;
}
const Validator = {
  validatePurchaseMoney(money) {
    if (money < MONEY_UNIT) {
      throw new Error(ERROR_MESSAGE.PURCHASE_MONEY.MIN);
    }
    if (isNaN(money)) {
      throw new Error(ERROR_MESSAGE.PURCHASE_MONEY.NUMBER);
    }
    if (money % MONEY_UNIT !== 0) {
      throw new Error(ERROR_MESSAGE.PURCHASE_MONEY.UNIT);
    }
  },
  validateWinningNumber(winningNumber) {
    const winningNumberArray = winningNumber.split(",");
    const regex = /^[0-9,]+$/;
    if (winningNumberArray.length !== 6) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.LENGTH);
    }
    if (winningNumberArray.some((number) => number === "")) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.LENGTH);
    }
    if (winningNumber.includes(",,")) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.COMMA);
    }
    if (checkNumberRange(winningNumberArray).includes(false)) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.RANGE);
    }
    if (!regex.test(winningNumber)) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.REGEX);
    }
    const set = new Set(winningNumberArray);
    if (set.size < LOTTO_RANGE.COUNT) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.DUPLICATE);
    }
  },
  validateBonusNumber(winningNumber, bonusNumber) {
    const winningNumberArray = winningNumber.split(",").map(Number);
    if (bonusNumber < LOTTO_RANGE.MIN || bonusNumber > LOTTO_RANGE.MAX) {
      throw new Error(ERROR_MESSAGE.BONUS_NUMBER.RANGE);
    }
    if (isNaN(bonusNumber)) {
      throw new Error(ERROR_MESSAGE.BONUS_NUMBER.NUMBER);
    }
    if (winningNumberArray.includes(bonusNumber)) {
      throw new Error(ERROR_MESSAGE.BONUS_NUMBER.DUPLICATE);
    }
  },
  validateRetry(retry) {
    if (!RETRY_ANSWER.YES.includes(retry) && !RETRY_ANSWER.NO.includes(retry)) {
      throw new Error(ERROR_MESSAGE.RETRY.INVALID);
    }
  }
};
function calculateLottoCountService(money) {
  return money / MONEY_UNIT;
}
class Lotto {
  #numbers;
  constructor() {
    this.#numbers = this.getRandomLotto();
  }
  getRandomLotto() {
    const lottoSet = /* @__PURE__ */ new Set();
    while (lottoSet.size < LOTTO_RANGE.COUNT) {
      lottoSet.add(
        Math.floor(Math.random() * LOTTO_RANGE.MAX + LOTTO_RANGE.MIN)
      );
    }
    const lottoArray = Array.from(lottoSet);
    lottoArray.sort((a, b) => a - b);
    return lottoArray;
  }
  getRank(winningLotto) {
    const matchCount = this.#countMatches(winningLotto);
    const hasBonus = this.#numbers.some((n) => winningLotto.isBonus(n));
    if (matchCount === 6) return "FIRST";
    if (matchCount === 5 && hasBonus) return "SECOND";
    if (matchCount === 5) return "THIRD";
    if (matchCount === 4) return "FOURTH";
    if (matchCount === 3) return "FIFTH";
  }
  #countMatches(winningLotto) {
    return this.#numbers.filter((n) => winningLotto.hasNumber(n)).length;
  }
  getNumbers() {
    return [...this.#numbers];
  }
}
function lottoService(count) {
  const lottos = [];
  for (let i = 0; i < count; i++) {
    lottos.push(new Lotto());
  }
  return lottos;
}
class WinningLotto {
  #winningNumber;
  #bonusNumber;
  constructor(winningNumber, bonusNumber) {
    this.#winningNumber = this.#splitWinnigNumber(winningNumber);
    this.#bonusNumber = Number(bonusNumber);
  }
  #splitWinnigNumber(winningNumber) {
    return winningNumber.split(",").map(Number);
  }
  hasNumber(number) {
    return this.#winningNumber.includes(number);
  }
  isBonus(number) {
    return this.#bonusNumber === number;
  }
}
function compareResultService(userLottos, winningLotto) {
  const count = {
    FIRST: 0,
    SECOND: 0,
    THIRD: 0,
    FOURTH: 0,
    FIFTH: 0
  };
  userLottos.forEach((userLotto) => {
    const rank = userLotto.getRank(winningLotto);
    count[rank]++;
  });
  return count;
}
function profitService(money, result) {
  const totalPrize = result.FIRST * PRIZE.FIRST + result.SECOND * PRIZE.SECOND + result.THIRD * PRIZE.THIRD + result.FOURTH * PRIZE.FOURTH + result.FIFTH * PRIZE.FIFTH;
  const profit = (totalPrize / money * 100).toFixed(1);
  return profit;
}
class LottoWebController {
  constructor() {
    this.money = 0;
    this.randomLottos = [];
    this.inputView = new LottoWebInputView();
    this.outputView = new LottoWebOutputView();
  }
  play() {
    this.inputView.bindPurchase(() => this.handlePurchase());
    this.inputView.bindSubmit(() => this.handleSubmit());
    this.inputView.bindCloseModal(() => this.handleCloseModal());
    this.inputView.bindRestart(() => this.handleRestart());
  }
  handlePurchase() {
    try {
      this.outputView.clearMoneyError();
      const money = this.inputView.getPurchaseMoney();
      Validator.validatePurchaseMoney(money);
      this.money = money;
      const count = calculateLottoCountService(money);
      this.randomLottos = lottoService(count);
      this.outputView.showPurchaseSection();
      this.outputView.renderLottoCount(count);
      this.outputView.renderLottos(this.randomLottos);
    } catch (error) {
      this.outputView.showMoneyError(error.message);
    }
  }
  handleSubmit() {
    try {
      this.outputView.clearWinningBonusError();
      const winningNumbers = this.inputView.getWinningNumbers();
      Validator.validateWinningNumber(winningNumbers);
      const bonusNumber = this.inputView.getBonusNumber();
      Validator.validateBonusNumber(winningNumbers, bonusNumber);
      const winningLotto = new WinningLotto(winningNumbers, bonusNumber);
      const result = compareResultService(this.randomLottos, winningLotto);
      const profit = profitService(this.money, result);
      this.outputView.renderResult(result);
      this.outputView.renderProfit(profit);
      this.outputView.showModal();
    } catch (error) {
      this.outputView.showWinningBonusError(error.message);
    }
  }
  handleCloseModal() {
    this.outputView.hideModal();
  }
  handleRestart() {
    this.money = 0;
    this.randomLottos = [];
    this.outputView.hidePurchaseSection();
    this.inputView.reset();
    this.outputView.hideModal();
  }
}
const lottoWeb = new LottoWebController();
lottoWeb.play();
