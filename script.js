// ========================================================
// 1. 데이터베이스 이관용 기초 데이터 배열 (회원 등급 · 상품)
// ========================================================
const MEMBER_GRADES = [
  { level: 1, name: "WELCOME", minSpent: 0, rate: 0.01, rateLabel: "1%" },
  { level: 2, name: "SILVER", minSpent: 30000, rate: 0.03, rateLabel: "3%" },
  { level: 3, name: "GOLD", minSpent: 70000, rate: 0.05, rateLabel: "5%" },
  { level: 4, name: "VIP", minSpent: 150000, rate: 0.07, rateLabel: "7%" }
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "버터 베어 모루 인형 키링",
    category: "인형/모루",
    price: 13500,
    stock: 25,
    image: "img/product1.svg",
    desc: "폭신한 파스텔 옐로우 모루로 한 땀씩 제작한 곰돌이 인형 키링입니다. 가방이나 파우치에 달기 좋은 아담한 크기입니다."
  },
  {
    id: 2,
    name: "크림 버니 리본 키링",
    category: "인형/모루",
    price: 14500,
    stock: 18,
    image: "img/product2.svg",
    desc: "보들보들한 크림 화이트 토끼 인형에 레몬빛 리본 포인트를 더한 러블리 키링입니다."
  },
  {
    id: 3,
    name: "병아리 뽀글이 미니 파우치 키링",
    category: "인형/모루",
    price: 16000,
    stock: 12,
    image: "img/product3.svg",
    desc: "립밤이나 이어폰을 보관할 수 있는 지퍼 파우치 겸용 병아리 키링입니다."
  },
  {
    id: 4,
    name: "레몬 소다 하트 아크릴 키링",
    category: "아크릴",
    price: 8500,
    stock: 40,
    image: "img/product4.svg",
    desc: "투명 아크릴 속 상큼한 레몬과 탄산 방울 그래픽이 담긴 양면 인쇄 키링입니다."
  },
  {
    id: 5,
    name: "클로버 럭키 캣 아크릴 키링",
    category: "아크릴",
    price: 9000,
    stock: 35,
    image: "img/product5.svg",
    desc: "네잎클로버를 안고 있는 고양이 일러스트와 별 모양 고리가 어우러진 행운 키링입니다."
  },
  {
    id: 6,
    name: "데이지 플라워 비즈 스트랩",
    category: "비즈/스트랩",
    price: 11000,
    stock: 22,
    image: "img/product6.svg",
    desc: "화이트와 옐로우 시드 비즈로 데이지 꽃을 엮어 만든 핸드메이드 스트랩 키링입니다."
  },
  {
    id: 7,
    name: "허니 펄 리본 비즈 키링",
    category: "비즈/스트랩",
    price: 12500,
    stock: 15,
    image: "img/product7.svg",
    desc: "은은한 진주 비즈와 투명 옐로우 하트 참이 조화로운 키치 무드 키링입니다."
  },
  {
    id: 8,
    name: "선샤인 스마일 체인 키링",
    category: "비즈/스트랩",
    price: 9800,
    stock: 30,
    image: "img/product8.svg",
    desc: "산뜻한 옐로우 스마일 참과 데이지 참이 달린 경쾌한 데일리 백참 키링입니다."
  }
];

// ========================================================
// 2. 로컬 저장소 상태 관리 (다음 주 DB 연동 시 API로 교체)
// ========================================================
const STORAGE_KEYS = {
  PRODUCTS: "keyring_products_v1",
  USERS: "keyring_users_v1",
  CURRENT_USER: "keyring_current_user_v1",
  CART: "keyring_cart_v1",
  ORDERS: "keyring_orders_v1"
};

let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [...INITIAL_PRODUCTS];
let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
let currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || null;
let cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
let orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];

let selectedCategory = "전체";
let searchKeyword = "";
let currentSlide = 0;
let slideTimer = null;

function saveAllState() {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  if (currentUserId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, currentUserId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function getCurrentUser() {
  return users.find((u) => u.id === currentUserId) || null;
}

function getUserGrade(totalSpent) {
  let matched = MEMBER_GRADES[0];
  for (const grade of MEMBER_GRADES) {
    if (totalSpent >= grade.minSpent) {
      matched = grade;
    }
  }
  return matched;
}

function formatPrice(num) {
  return num.toLocaleString("ko-KR") + "원";
}

// ========================================================
// 3. 배너 슬라이드 (사진 4장 · 6초 간격 자동 전환)
// ========================================================
function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  if (!slides.length) return;

  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === currentSlide);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

function startSlideAutoPlay() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 6000);
}

// ========================================================
// 4. 상품 목록 · 검색 · 분류 필터 · 상세 모달
// ========================================================
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const emptyMsg = document.getElementById("emptyProductMsg");

  const filtered = products.filter((item) => {
    const matchCategory = selectedCategory === "전체" || item.category === selectedCategory;
    const kw = searchKeyword.trim().toLowerCase();
    const matchSearch =
      !kw ||
      item.name.toLowerCase().includes(kw) ||
      item.category.toLowerCase().includes(kw) ||
      item.desc.toLowerCase().includes(kw);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyMsg.classList.remove("hidden");
    return;
  }

  emptyMsg.classList.add("hidden");
  grid.innerHTML = filtered
    .map(
      (item) => `
      <article class="product-card">
        <div class="product-thumb" data-detail-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="product-info">
          <span class="category-tag">${item.category}</span>
          <h2 class="product-name" data-detail-id="${item.id}">${item.name}</h2>
          <p class="product-price">${formatPrice(item.price)}</p>
          <p class="product-stock">남은 수량: ${item.stock}개</p>
          <div class="card-actions">
            <button type="button" class="btn-outline" data-detail-id="${item.id}">상세보기</button>
            <button type="button" class="btn-yellow" data-add-id="${item.id}" ${item.stock === 0 ? "disabled" : ""}>
              ${item.stock === 0 ? "품절" : "담기"}
            </button>
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

function updateCategoryUI(category) {
  selectedCategory = category;

  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.category === category);
  });

  renderProducts();
}

function openProductDetail(productId) {
  const item = products.find((p) => p.id === productId);
  if (!item) return;

  const user = getCurrentUser();
  const grade = getUserGrade(user ? user.totalSpent : 0);
  const expectedPoint = Math.floor(item.price * grade.rate);
  let detailQty = 1;

  const body = document.getElementById("productDetailBody");
  body.innerHTML = `
    <div class="detail-grid">
      <div class="detail-img-wrap">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div>
        <span class="category-tag">${item.category}</span>
        <h2 id="detailTitle" style="margin: 8px 0 4px; font-size: 20px;">${item.name}</h2>
        <p class="product-price" style="font-size: 21px;">${formatPrice(item.price)}</p>
        <p class="detail-desc">${item.desc}</p>
        <p class="product-stock" style="margin-bottom: 10px;">
          재고 ${item.stock}개 · 예상 적립 ${expectedPoint.toLocaleString()}P (${grade.name} ${grade.rateLabel})
        </p>

        <div class="qty-control">
          <button type="button" id="detailMinusBtn">-</button>
          <span id="detailQtyVal">1</span>
          <button type="button" id="detailPlusBtn">+</button>
        </div>

        <div class="card-actions">
          <button type="button" class="btn-outline" id="detailAddCartBtn">장바구니 담기</button>
          <button type="button" class="btn-yellow" id="detailDirectOrderBtn">바로 체험결제</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("detailMinusBtn").onclick = () => {
    if (detailQty > 1) {
      detailQty -= 1;
      document.getElementById("detailQtyVal").textContent = detailQty;
    }
  };

  document.getElementById("detailPlusBtn").onclick = () => {
    if (detailQty < item.stock) {
      detailQty += 1;
      document.getElementById("detailQtyVal").textContent = detailQty;
    }
  };

  document.getElementById("detailAddCartBtn").onclick = () => {
    addToCart(item.id, detailQty);
    closeModal("productModal");
  };

  document.getElementById("detailDirectOrderBtn").onclick = () => {
    addToCart(item.id, detailQty, true);
    closeModal("productModal");
    openCartModal();
  };

  openModal("productModal");
}

// ========================================================
// 5. 장바구니 & 체험 결제 & 포인트 적립
// ========================================================
function updateHeaderUI() {
  const totalCount = cart.reduce((sum, c) => sum + c.qty, 0);
  document.getElementById("cartCount").textContent = totalCount;

  const user = getCurrentUser();
  const authBtn = document.getElementById("openAuthBtn");
  if (user) {
    authBtn.textContent = `${user.name}님 · 로그아웃`;
  } else {
    authBtn.textContent = "로그인";
  }
}

function addToCart(productId, qty = 1, silent = false) {
  const product = products.find((p) => p.id === productId);
  if (!product || product.stock <= 0) {
    alert("현재 품절된 상품입니다.");
    return;
  }

  const existing = cart.find((c) => c.productId === productId);
  if (existing) {
    const nextQty = Math.min(product.stock, existing.qty + qty);
    existing.qty = nextQty;
  } else {
    cart.push({ productId, qty: Math.min(product.stock, qty) });
  }

  saveAllState();
  updateHeaderUI();
  if (!silent) {
    alert(`'${product.name}' 상품을 장바구니에 담았습니다.`);
  }
}

function openCartModal() {
  renderCartModal();
  openModal("cartModal");
}

function renderCartModal() {
  const container = document.getElementById("cartContent");
  const user = getCurrentUser();

  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-message">장바구니가 비어 있습니다. 마음에 드는 키링을 담아보세요!</p>`;
    return;
  }

  let productTotal = 0;
  const itemsHtml = cart
    .map((entry) => {
      const product = products.find((p) => p.id === entry.productId);
      if (!product) return "";
      const subTotal = product.price * entry.qty;
      productTotal += subTotal;

      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}" class="cart-item-img" />
          <div class="cart-item-info">
            <p class="cart-item-title">${product.name}</p>
            <p class="cart-item-price">${formatPrice(product.price)} × ${entry.qty}개 = <strong>${formatPrice(subTotal)}</strong></p>
          </div>
          <div class="cart-item-controls">
            <button type="button" class="mini-btn" data-cart-dec="${product.id}">-</button>
            <span>${entry.qty}</span>
            <button type="button" class="mini-btn" data-cart-inc="${product.id}">+</button>
            <button type="button" class="del-btn" data-cart-del="${product.id}">삭제</button>
          </div>
        </div>
      `;
    })
    .join("");

  const shippingFee = productTotal >= 30000 ? 0 : 3000;
  const baseTotal = productTotal + shippingFee;
  const grade = getUserGrade(user ? user.totalSpent : 0);

  container.innerHTML = `
    <div>${itemsHtml}</div>

    <div class="checkout-box">
      <div class="summary-row">
        <span>상품 합계</span>
        <span>${formatPrice(productTotal)}</span>
      </div>
      <div class="summary-row">
        <span>배송비 (3만원 이상 무료)</span>
        <span>${shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span>
      </div>

      ${
        user
          ? `
        <div class="point-use-row">
          <label for="usePointInput" style="font-size: 13px; font-weight: 700;">
            포인트 사용 (보유: ${user.points.toLocaleString()}P)
          </label>
          <input type="number" id="usePointInput" min="0" max="${Math.min(user.points, baseTotal)}" step="100" value="0" />
        </div>
        <div class="checkout-fields">
          <label class="form-label">
            받는 분 성함
            <input type="text" id="orderReceiver" value="${user.name}" required />
          </label>
          <label class="form-label">
            배송지 주소
            <input type="text" id="orderAddress" value="서울시 마포구 와우산로 94" required />
          </label>
        </div>
      `
          : `<p class="benefit-banner">체험 결제를 진행하려면 먼저 로그인해 주세요. (가입 시 3,000P 지급)</p>`
      }

      <div class="summary-row total">
        <span>최종 결제 예정 금액</span>
        <span id="finalPayText">${formatPrice(baseTotal)}</span>
      </div>
      <div class="summary-row" style="color: #5c4318; font-size: 13px;">
        <span>적립 예정 포인트 (${grade.name} · ${grade.rateLabel})</span>
        <span id="earnPointText">+${Math.floor(baseTotal * grade.rate).toLocaleString()}P</span>
      </div>

      <button type="button" class="primary-full-btn" id="trialCheckoutBtn" style="margin-top: 10px;">
        ${user ? "체험 결제하기 (주문 내역 저장)" : "로그인하고 체험 결제하기"}
      </button>
    </div>
  `;

  if (user) {
    const pointInput = document.getElementById("usePointInput");
    pointInput.addEventListener("input", () => {
      let used = parseInt(pointInput.value, 10) || 0;
      const maxUsable = Math.min(user.points, baseTotal);
      if (used < 0) used = 0;
      if (used > maxUsable) used = maxUsable;
      pointInput.value = used;

      const finalPay = baseTotal - used;
      const earned = Math.floor(finalPay * grade.rate);
      document.getElementById("finalPayText").textContent = formatPrice(finalPay);
      document.getElementById("earnPointText").textContent = `+${earned.toLocaleString()}P`;
    });
  }

  document.getElementById("trialCheckoutBtn").onclick = () => {
    if (!user) {
      closeModal("cartModal");
      openModal("authModal");
      return;
    }

    const receiver = document.getElementById("orderReceiver").value.trim();
    const address = document.getElementById("orderAddress").value.trim();
    if (!receiver || !address) {
      alert("받는 분 성함과 배송지 주소를 입력해 주세요.");
      return;
    }

    const usedPoints = Math.min(
      user.points,
      baseTotal,
      Math.max(0, parseInt(document.getElementById("usePointInput").value, 10) || 0)
    );
    const finalPay = baseTotal - usedPoints;
    const earnedPoints = Math.floor(finalPay * grade.rate);

    // 재고 차감 및 주문 항목 구성
    const orderItems = cart.map((entry) => {
      const prod = products.find((p) => p.id === entry.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - entry.qty);
      }
      return {
        productId: entry.productId,
        name: prod ? prod.name : "키링 상품",
        price: prod ? prod.price : 0,
        qty: entry.qty
      };
    });

    const newOrder = {
      orderId: "ORD-" + Date.now().toString().slice(-6),
      userId: user.id,
      receiver,
      address,
      items: orderItems,
      totalPrice: finalPay,
      usedPoints,
      earnedPoints,
      date: new Date().toLocaleString("ko-KR")
    };

    orders.unshift(newOrder);
    user.points = user.points - usedPoints + earnedPoints;
    user.totalSpent += finalPay;
    cart = [];

    saveAllState();
    updateHeaderUI();
    renderProducts();
    closeModal("cartModal");

    const updatedGrade = getUserGrade(user.totalSpent);
    alert(
      `체험 결제가 완료되었습니다!\n` +
        `주문번호: ${newOrder.orderId}\n` +
        `결제금액: ${formatPrice(finalPay)} / 적립: +${earnedPoints.toLocaleString()}P\n` +
        `현재 회원등급: ${updatedGrade.name} (${updatedGrade.rateLabel})`
    );
  };
}

// ========================================================
// 6. 회원가입 · 로그인 · 마이페이지
// ========================================================
function switchAuthTab(tabName) {
  document.querySelectorAll(".auth-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  if (tabName === "login") {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  } else {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
  }
}

function openMyPage() {
  const user = getCurrentUser();
  if (!user) {
    alert("마이페이지는 로그인 후 이용할 수 있습니다.");
    openModal("authModal");
    return;
  }

  const grade = getUserGrade(user.totalSpent);
  const myOrders = orders.filter((o) => o.userId === user.id);

  const gradeRows = MEMBER_GRADES.map(
    (g) => `
      <tr style="${g.name === grade.name ? "background-color:#fff9db; font-weight:700;" : ""}">
        <td>${g.name}</td>
        <td>${g.minSpent.toLocaleString()}원 이상</td>
        <td>${g.rateLabel} 적립</td>
      </tr>
    `
  ).join("");

  const ordersHtml =
    myOrders.length === 0
      ? `<p class="empty-message">아직 주문 내역이 없습니다. 장바구니에서 체험 결제를 진행해 보세요!</p>`
      : myOrders
          .map((ord) => {
            const itemSummary = ord.items.map((i) => `${i.name} (${i.qty}개)`).join(", ");
            return `
              <div class="order-card">
                <div class="order-head">
                  <span>주문번호 ${ord.orderId}</span>
                  <span>${ord.date}</span>
                </div>
                <p class="order-items-text">${itemSummary}</p>
                <div class="order-foot">
                  <span>결제금액: <strong>${formatPrice(ord.totalPrice)}</strong></span>
                  <span>사용 ${ord.usedPoints.toLocaleString()}P · 적립 +${ord.earnedPoints.toLocaleString()}P</span>
                </div>
              </div>
            `;
          })
          .join("");

  document.getElementById("myPageContent").innerHTML = `
    <div class="profile-card">
      <div class="profile-top">
        <div>
          <strong style="font-size: 18px;">${user.name}</strong>
          <span style="font-size: 13px; color: #666666;">(@${user.id})</span>
        </div>
        <span class="grade-pill">${grade.name} 등급 · ${grade.rateLabel} 적립</span>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <span class="stat-label">보유 포인트</span>
          <span class="stat-value">${user.points.toLocaleString()}P</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">누적 구매금액</span>
          <span class="stat-value">${formatPrice(user.totalSpent)}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">총 주문 건수</span>
          <span class="stat-value">${myOrders.length}건</span>
        </div>
      </div>
    </div>

    <h3 style="margin: 0 0 8px; font-size: 15px;">회원 등급별 적립 혜택 (4단계)</h3>
    <table class="grade-table">
      <thead>
        <tr>
          <th>등급</th>
          <th>누적 구매 기준</th>
          <th>적립률</th>
        </tr>
      </thead>
      <tbody>${gradeRows}</tbody>
    </table>

    <h3 style="margin: 0 0 10px; font-size: 15px;">체험 결제 주문 내역</h3>
    <div>${ordersHtml}</div>
  `;

  openModal("myPageModal");
}

// ========================================================
// 7. 모달 제어 및 이벤트 바인딩
// ========================================================
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateHeaderUI();
  startSlideAutoPlay();

  // 슬라이드 수동 조작
  document.getElementById("prevSlideBtn").addEventListener("click", () => {
    showSlide(currentSlide - 1);
    startSlideAutoPlay();
  });

  document.getElementById("nextSlideBtn").addEventListener("click", () => {
    showSlide(currentSlide + 1);
    startSlideAutoPlay();
  });

  document.getElementById("sliderDots").addEventListener("click", (e) => {
    if (e.target.classList.contains("dot")) {
      showSlide(Number(e.target.dataset.index));
      startSlideAutoPlay();
    }
  });

  // 상단 메뉴 및 필터 클릭
  document.querySelectorAll(".nav-link, .filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateCategoryUI(btn.dataset.category);
    });
  });

  // 로고 클릭 시 초기화
  document.getElementById("logoBtn").addEventListener("click", () => {
    searchKeyword = "";
    document.getElementById("searchInput").value = "";
    updateCategoryUI("전체");
  });

  // 검색
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    searchKeyword = document.getElementById("searchInput").value;
    renderProducts();
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchKeyword = e.target.value;
    renderProducts();
  });

  // 상품 카드 위임 이벤트 (상세보기 / 장바구니 담기)
  document.getElementById("productGrid").addEventListener("click", (e) => {
    const detailTarget = e.target.closest("[data-detail-id]");
    if (detailTarget) {
      openProductDetail(Number(detailTarget.dataset.detailId));
      return;
    }

    const addTarget = e.target.closest("[data-add-id]");
    if (addTarget) {
      addToCart(Number(addTarget.dataset.addId), 1);
    }
  });

  // 장바구니 내 수량 변경 및 삭제
  document.getElementById("cartContent").addEventListener("click", (e) => {
    if (e.target.dataset.cartInc) {
      const id = Number(e.target.dataset.cartInc);
      const item = cart.find((c) => c.productId === id);
      const prod = products.find((p) => p.id === id);
      if (item && prod && item.qty < prod.stock) {
        item.qty += 1;
        saveAllState();
        updateHeaderUI();
        renderCartModal();
      }
    } else if (e.target.dataset.cartDec) {
      const id = Number(e.target.dataset.cartDec);
      const item = cart.find((c) => c.productId === id);
      if (item && item.qty > 1) {
        item.qty -= 1;
        saveAllState();
        updateHeaderUI();
        renderCartModal();
      }
    } else if (e.target.dataset.cartDel) {
      const id = Number(e.target.dataset.cartDel);
      cart = cart.filter((c) => c.productId !== id);
      saveAllState();
      updateHeaderUI();
      renderCartModal();
    }
  });

  // 헤더 버튼 (장바구니 / 마이페이지 / 로그인·로그아웃)
  document.getElementById("openCartBtn").addEventListener("click", openCartModal);
  document.getElementById("openMyPageBtn").addEventListener("click", openMyPage);

  document.getElementById("openAuthBtn").addEventListener("click", () => {
    if (getCurrentUser()) {
      currentUserId = null;
      saveAllState();
      updateHeaderUI();
      alert("로그아웃되었습니다.");
    } else {
      switchAuthTab("login");
      openModal("authModal");
    }
  });

  // 로그인/회원가입 탭 전환
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchAuthTab(tab.dataset.tab));
  });

  // 회원가입 처리 (가입 즉시 3,000P 적립)
  document.getElementById("signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const id = document.getElementById("signupId").value.trim();
    const pw = document.getElementById("signupPw").value.trim();

    if (users.some((u) => u.id === id)) {
      alert("이미 사용 중인 아이디입니다.");
      return;
    }

    const newUser = {
      id,
      pw,
      name,
      points: 3000,
      totalSpent: 0
    };

    users.push(newUser);
    currentUserId = newUser.id;
    saveAllState();
    updateHeaderUI();
    closeModal("authModal");
    e.target.reset();
    alert(`${name}님 환영합니다! 가입 축하 포인트 3,000P가 지급되었습니다.`);
  });

  // 로그인 처리
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("loginId").value.trim();
    const pw = document.getElementById("loginPw").value.trim();

    const matched = users.find((u) => u.id === id && u.pw === pw);
    if (!matched) {
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
      return;
    }

    currentUserId = matched.id;
    saveAllState();
    updateHeaderUI();
    closeModal("authModal");
    e.target.reset();
    alert(`${matched.name}님, 반갑습니다!`);
  });

  // 모달 닫기 버튼 및 배경 클릭
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add("hidden");
      }
    });
  });
});
