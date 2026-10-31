// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, ee = h.trustedTypes, g = ee ? ee.emptyScript : "", te = h.reactiveElementPolyfillSupport, _ = (e, t) => e, ne = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? g : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, v = (e, t) => !l(e, t), re = {
	attribute: !0,
	type: String,
	converter: ne,
	reflect: !1,
	useDefault: !1,
	hasChanged: v
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = re) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? re;
	}
	static _$Ei() {
		if (this.hasOwnProperty(_("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(_("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(_("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? ne : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ne : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? v)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[_("elementProperties")] = /* @__PURE__ */ new Map(), y[_("finalized")] = /* @__PURE__ */ new Map(), te?.({ ReactiveElement: y }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ie = globalThis, b = (e) => e, x = ie.trustedTypes, ae = x ? x.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, S = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, oe = "?" + C, se = `<${oe}>`, w = document, ce = () => w.createComment(""), le = (e) => e === null || typeof e != "object" && typeof e != "function", ue = Array.isArray, de = (e) => ue(e) || typeof e?.[Symbol.iterator] == "function", fe = "[ 	\n\f\r]", pe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, me = /-->/g, he = />/g, ge = RegExp(`>|${fe}(?:([^\\s"'>=/]+)(${fe}*=${fe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), _e = /'/g, ve = /"/g, ye = /^(?:script|style|textarea|title)$/i, be = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), T = be(1), xe = be(2), Se = Symbol.for("lit-noChange"), E = Symbol.for("lit-nothing"), Ce = /* @__PURE__ */ new WeakMap(), we = w.createTreeWalker(w, 129);
function Te(e, t) {
	if (!ue(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ae === void 0 ? t : ae.createHTML(t);
}
var Ee = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = pe;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === pe ? c[1] === "!--" ? o = me : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = ge) : (ye.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = ge) : o = he : o === ge ? c[0] === ">" ? (o = i ?? pe, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? ge : c[3] === "\"" ? ve : _e) : o === ve || o === _e ? o = ge : o === me || o === he ? o = pe : (o = ge, i = void 0);
		let d = o === ge && e[t + 1].startsWith("/>") ? " " : "";
		a += o === pe ? n + se : l >= 0 ? (r.push(s), n.slice(0, l) + S + n.slice(l) + C + d) : n + C + (l === -2 ? t : d);
	}
	return [Te(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, De = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Ee(t, n);
		if (this.el = e.createElement(l, r), we.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = we.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(S)) {
					let t = u[o++], n = i.getAttribute(e).split(C), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Me : r[1] === "?" ? Ne : r[1] === "@" ? Pe : je
					}), i.removeAttribute(e);
				} else e.startsWith(C) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ye.test(i.tagName)) {
					let e = i.textContent.split(C), t = e.length - 1;
					if (t > 0) {
						i.textContent = x ? x.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], ce()), we.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], ce());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === oe) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(C, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += C.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = w.createElement("template");
		return n.innerHTML = e, n;
	}
};
function Oe(e, t, n = e, r) {
	if (t === Se) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = le(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Oe(e, i._$AS(e, t.values), i, r)), t;
}
var ke = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? w).importNode(t, !0);
		we.currentNode = r;
		let i = we.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Ae(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Fe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = we.nextNode(), a++);
		}
		return we.currentNode = w, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Ae = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = Oe(this, e, t), le(e) ? e === E || e == null || e === "" ? (this._$AH !== E && this._$AR(), this._$AH = E) : e !== this._$AH && e !== Se && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? de(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== E && le(this._$AH) ? this._$AA.nextSibling.data = e : this.T(w.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = De.createElement(Te(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new ke(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ce.get(e.strings);
		return t === void 0 && Ce.set(e.strings, t = new De(e)), t;
	}
	k(t) {
		ue(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(ce()), this.O(ce()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = b(e).nextSibling;
			b(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, je = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = E, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = E;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = Oe(this, e, t, 0), a = !le(e) || e !== this._$AH && e !== Se, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Oe(this, r[n + o], t, o), s === Se && (s = this._$AH[o]), a ||= !le(s) || s !== this._$AH[o], s === E ? e = E : e !== E && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Me = class extends je {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === E ? void 0 : e;
	}
}, Ne = class extends je {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== E);
	}
}, Pe = class extends je {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Oe(this, e, t, 0) ?? E) === Se) return;
		let n = this._$AH, r = e === E && n !== E || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== E && (n === E || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Fe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		Oe(this, e);
	}
}, Ie = {
	M: S,
	P: C,
	A: oe,
	C: 1,
	L: Ee,
	R: ke,
	D: de,
	V: Oe,
	I: Ae,
	H: je,
	N: Ne,
	U: Pe,
	B: Me,
	F: Fe
}, Le = ie.litHtmlPolyfillSupport;
Le?.(De, Ae), (ie.litHtmlVersions ??= []).push("3.3.3");
var Re = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Ae(t.insertBefore(ce(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, ze = globalThis, D = class extends y {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Re(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return Se;
	}
};
D._$litElement$ = !0, D.finalized = !0, ze.litElementHydrateSupport?.({ LitElement: D });
var Be = ze.litElementPolyfillSupport;
Be?.({ LitElement: D }), (ze.litElementVersions ??= []).push("4.2.2");
// src/styles.js
var O = o`
  :host {
    --it-radius: var(--ha-card-border-radius, 20px);
    --it-surface: var(--card-background-color, #fff);
    --it-text: var(--primary-text-color, #1c1c1e);
    --it-muted: var(--secondary-text-color, #6e6e73);
    --it-accent: var(--primary-color, #ff8a3d);
    --it-on-accent: var(--text-primary-color, #fff);
    --it-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --it-soft: color-mix(in srgb, var(--it-accent) 12%, transparent);
    --it-warn: var(--warning-color, #f5a524);
    --it-error: var(--error-color, #e5484d);
    color: var(--it-text);
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, system-ui, sans-serif));
  }
  * { box-sizing: border-box; }
  .card {
    background: var(--it-surface);
    border-radius: var(--it-radius);
    box-shadow: var(--ha-card-box-shadow, 0 2px 12px rgba(0, 0, 0, 0.06));
    border: var(--ha-card-border-width, 0) solid var(--ha-card-border-color, var(--it-divider));
    padding: 20px;
  }
  h2 { font-size: 1.05rem; font-weight: 600; margin: 0 0 12px; }
  .muted { color: var(--it-muted); }
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 12px; border-radius: 999px; font-size: 0.8rem;
    background: var(--it-soft); color: var(--it-text); border: none;
    font: inherit; font-size: 0.8rem; cursor: default;
  }
  button.chip { cursor: pointer; }
  .chip.active { background: var(--it-accent); color: var(--it-on-accent); }
  .btn {
    font: inherit; font-weight: 600; cursor: pointer; border: none;
    border-radius: 999px; padding: 10px 20px;
    background: var(--it-accent); color: var(--it-on-accent);
  }
  .btn.quiet { background: var(--it-soft); color: var(--it-text); }
  .btn.danger { background: transparent; color: var(--it-error); }
  .btn:disabled { opacity: 0.5; cursor: default; }
  input[type="text"], input[type="url"], input[type="search"], textarea {
    width: 100%; font: inherit; color: var(--it-text);
    background: var(--input-fill-color, var(--secondary-background-color, #f2f2f7));
    border: 1px solid transparent; border-radius: 14px; padding: 12px 14px;
  }
  select, input[type="number"] {
    width: 100%; font: inherit; color: var(--it-text); padding: 10px 8px; border-radius: 12px;
    border: 1px solid transparent; background: var(--input-fill-color, var(--secondary-background-color, #f2f2f7));
  }
  input:focus, textarea:focus { outline: none; border-color: var(--it-accent); }
  label { display: block; font-size: 0.85rem; color: var(--it-muted); margin: 12px 0 6px; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .error { color: var(--it-error); margin: 12px 0; }
  .icon { background: none; border: none; color: inherit; cursor: pointer; padding: 12px; display: flex; border-radius: 50%; }
  .icon:hover { background: var(--it-soft); }
  .icon:disabled { opacity: 0.5; cursor: default; }
  .icon svg { width: 24px; height: 24px; fill: currentColor; }
  .banner {
    border-radius: 14px; padding: 12px 16px; margin-bottom: 16px;
    background: color-mix(in srgb, var(--it-warn) 18%, transparent);
  }
`, Ve = {
	en: {
		recipes: "Recipes",
		search: "Search recipes",
		import: "Import",
		newRecipe: "New recipe",
		empty: "No recipes yet. Write one or import one from a web page to start.",
		back: "Back",
		ingredients: "Ingredients",
		steps: "Steps",
		notes: "Notes",
		variants: "Variants",
		servings: "Servings",
		minutes: "{n} min",
		variant: "Variant",
		stale: "The original changed since this translation was made.",
		retranslate: "Re-translate",
		translateTo: "Translate to {lang}",
		adapt: "Adapt",
		adaptHint: "What should change? e.g. make it vegetarian, simplify, use metric",
		asVariant: "Save as a new variant",
		run: "Run",
		delete: "Delete",
		confirmDelete: "Delete this recipe?",
		confirmDeleteAll: "It has translations or variants. Delete them too?",
		importTitle: "Import from a web page",
		url: "Recipe URL",
		note: "Note for the AI (optional)",
		noteHint: "e.g. convert to metric, skip the dessert",
		working: "Working on it. AI actions can take a few minutes.",
		review: "Review before saving",
		newIngredients: "New ingredients",
		save: "Save",
		discard: "Discard",
		tokens: "{in} tokens in, {out} out",
		title: "Title",
		source: "Source",
		description: "Description",
		prepMinutes: "Prep (min)",
		cookMinutes: "Cook (min)",
		totalMinutes: "Total (min)",
		ingredient: "Ingredient",
		amount: "Amount",
		unit: "Unit",
		lineNote: "Note",
		section: "Section",
		remove: "Remove",
		addLine: "Ingredient",
		addStep: "Step",
		addSection: "Section",
		newSection: "Name of the new section",
		headingToStep: "Turn this heading back into a step",
		drag: "Drag to move",
		makeHeading: "Make this step a heading for the steps below it",
		sectionPlaceholder: "No section (type to name it)",
		tags: "Tags (comma separated)",
		edit: "Edit",
		cancel: "Cancel",
		usedAs: "In this recipe",
		newIngredientsExplain: "Saving adds these to your shared ingredient list, used by every recipe. Check each name; to use an ingredient you already have instead, pick it in the ingredient lines below.",
		drafts: "Drafts",
		ingredientSearch: "Search or add an ingredient",
		create: "Create",
		asNewVariant: "as a new variant",
		inProgress: "AI drafts for this recipe",
		status: {
			working: "Working…",
			ready: "Ready to review",
			failed: "Failed"
		},
		action: {
			import: "Import",
			translate: "Translation",
			adapt: "Adaptation"
		},
		structuring: "Structuring the ingredients with the AI. You can leave this page; the draft waits in the inbox.",
		workingLeave: "The AI is working on this. You can leave this page; the draft waits in the inbox.",
		units: "Units",
		catalogSearch: "Search by any name or other name",
		newEntry: "New",
		name: "Name",
		plural: "Plural",
		aliases: "Other names, comma separated",
		density: "Density (g per ml)",
		dimension: "Measures",
		dim_mass: "Weight",
		dim_volume: "Volume",
		dim_count: "Count",
		dim_other: "Other (cannot convert)",
		factor: "Size in {base}",
		items: "items",
		systems: "Measurement systems",
		sys_metric: "Metric",
		sys_us: "US",
		sys_imperial: "Imperial",
		sys_japanese: "Japanese",
		unused: "Unused",
		usedBy: "Used in {n} recipes",
		confirmDeleteEntry: "Delete “{name}”?",
		mergeInto: "Merge into another entry",
		mergeHint: "For duplicates. Pick the entry to keep: recipes switch to it, this entry's names become its other names, and this entry is deleted.",
		confirmMerge: "Merge “{from}” into “{to}”? This cannot be undone.",
		manage: "Manage",
		otherNames: "Other names",
		size: "Size",
		languages: "Languages",
		languagesHint: "Every ingredient and unit is named in these languages, and recipes can be translated into them. Removing one keeps the names already written in it.",
		languageCode: "Language code, e.g. fr",
		add: "Add",
		language: "Language",
		photo: "Photo",
		addPhoto: "Add photo",
		changePhoto: "Change photo",
		removePhoto: "Remove photo",
		photoLink: "Or paste an image link",
		ai: "AI",
		aiHint: "Any OpenAI-compatible API. Without it, recipes are written, edited and imported by hand; translate and adapt need it.",
		aiOn: "AI is on.",
		aiOff: "AI is off: give an API URL and a model to turn it on.",
		apiUrl: "API URL",
		apiKey: "API key",
		apiKeySet: "A key is saved. Type a new one to replace it.",
		model: "Model",
		modelFor: "Model for {action}",
		modelDefault: "Empty uses the main model",
		jsonMode: "JSON enforcement",
		json_schema: "Strict schema",
		json_json: "JSON mode",
		json_off: "Prompt only",
		extraBody: "Extra request fields (JSON)",
		extraBodyHint: "For Gemma on Workers AI: {\"chat_template_kwargs\": {\"enable_thinking\": false}}",
		invalidJson: "Extra request fields must be a JSON object.",
		advanced: "Advanced",
		task_extract: "import",
		task_structure: "ingredient lines",
		task_translate: "translation",
		task_adapt: "adaptation",
		saved: "Saved.",
		importNoAi: "AI is off, so only pages with embedded recipe data can be imported, and their ingredient lines are matched by hand in review."
	},
	ja: {
		recipes: "レシピ",
		search: "レシピを検索",
		import: "取り込み",
		newRecipe: "新しいレシピ",
		empty: "レシピはまだありません。書くか、Webページから取り込んで始めましょう。",
		back: "戻る",
		ingredients: "材料",
		steps: "作り方",
		notes: "メモ",
		variants: "アレンジ",
		servings: "人数",
		minutes: "{n}分",
		variant: "アレンジ",
		stale: "この翻訳の作成後に元のレシピが変更されました。",
		retranslate: "再翻訳",
		translateTo: "{lang}に翻訳",
		adapt: "アレンジ",
		adaptHint: "どう変えますか？ 例：ベジタリアン向けに、手順を簡単に",
		asVariant: "新しいアレンジとして保存",
		run: "実行",
		delete: "削除",
		confirmDelete: "このレシピを削除しますか？",
		confirmDeleteAll: "翻訳やアレンジがあります。それらも削除しますか？",
		importTitle: "Webページから取り込む",
		url: "レシピのURL",
		note: "AIへのメモ（任意）",
		noteHint: "例：メートル法に変換、デザートは除く",
		working: "処理中です。AIの処理には数分かかることがあります。",
		review: "保存前の確認",
		newIngredients: "新しい材料",
		save: "保存",
		discard: "破棄",
		tokens: "入力 {in} / 出力 {out} トークン",
		title: "タイトル",
		source: "出典",
		description: "説明",
		prepMinutes: "下準備（分）",
		cookMinutes: "調理（分）",
		totalMinutes: "合計（分）",
		ingredient: "材料",
		amount: "量",
		unit: "単位",
		lineNote: "メモ",
		section: "グループ",
		remove: "削除",
		addLine: "材料",
		addStep: "手順",
		addSection: "グループ",
		newSection: "新しいグループの名前",
		headingToStep: "この見出しを手順に戻す",
		drag: "ドラッグして移動",
		makeHeading: "この手順を以降の手順の見出しにする",
		sectionPlaceholder: "グループなし（入力して名前を付ける）",
		tags: "タグ（カンマ区切り）",
		edit: "編集",
		cancel: "キャンセル",
		usedAs: "このレシピでの表記",
		newIngredientsExplain: "保存すると、すべてのレシピで共有する材料リストに追加されます。名前を確認してください。既存の材料を使う場合は、下の材料行で選び直してください。",
		drafts: "下書き",
		ingredientSearch: "材料を検索・追加",
		create: "新規作成",
		asNewVariant: "新しいアレンジとして",
		inProgress: "このレシピのAI下書き",
		status: {
			working: "処理中…",
			ready: "確認待ち",
			failed: "失敗"
		},
		action: {
			import: "取り込み",
			translate: "翻訳",
			adapt: "アレンジ"
		},
		structuring: "AIが材料を整理しています。このページを離れても、下書きは受信箱に残ります。",
		workingLeave: "AIが処理中です。このページを離れても、下書きは受信箱に残ります。",
		units: "単位",
		catalogSearch: "名前・別名で検索",
		newEntry: "新規",
		name: "名前",
		plural: "複数形",
		aliases: "別名（カンマ区切り）",
		density: "密度（g/ml）",
		dimension: "計るもの",
		dim_mass: "重さ",
		dim_volume: "体積",
		dim_count: "個数",
		dim_other: "その他（換算不可）",
		factor: "{base}換算の大きさ",
		items: "個",
		systems: "単位系",
		sys_metric: "メートル法",
		sys_us: "米国",
		sys_imperial: "英国（帝国単位）",
		sys_japanese: "日本",
		unused: "未使用",
		usedBy: "{n}件のレシピで使用",
		confirmDeleteEntry: "「{name}」を削除しますか？",
		mergeInto: "ほかの項目に統合",
		mergeHint: "重複の整理用です。残す項目を選ぶと、レシピはその項目に切り替わり、この項目の名前はその別名になり、この項目は削除されます。",
		confirmMerge: "「{from}」を「{to}」に統合しますか？元に戻せません。",
		manage: "管理",
		otherNames: "別名",
		size: "大きさ",
		languages: "言語",
		languagesHint: "すべての材料と単位にこれらの言語で名前を付け、レシピはこれらの言語に翻訳できます。言語を外しても、その言語で書かれた名前は残ります。",
		languageCode: "言語コード（例：fr）",
		add: "追加",
		language: "言語",
		photo: "写真",
		addPhoto: "写真を追加",
		changePhoto: "写真を変更",
		removePhoto: "写真を削除",
		photoLink: "または画像のリンクを貼り付け",
		ai: "AI",
		aiHint: "OpenAI互換のAPI。なくてもレシピの作成・編集・インポートは手動でできます。翻訳とアレンジにはAIが必要です。",
		aiOn: "AIはオンです。",
		aiOff: "AIはオフです。API URLとモデルを入力するとオンになります。",
		apiUrl: "API URL",
		apiKey: "APIキー",
		apiKeySet: "キーは保存済みです。置き換えるには新しいキーを入力してください。",
		model: "モデル",
		modelFor: "{action}のモデル",
		modelDefault: "空欄ならメインのモデルを使用",
		jsonMode: "JSONの強制",
		json_schema: "厳密なスキーマ",
		json_json: "JSONモード",
		json_off: "プロンプトのみ",
		extraBody: "追加のリクエスト項目（JSON）",
		extraBodyHint: "Workers AIのGemmaの場合：{\"chat_template_kwargs\": {\"enable_thinking\": false}}",
		invalidJson: "追加のリクエスト項目はJSONオブジェクトにしてください。",
		advanced: "詳細設定",
		task_extract: "インポート",
		task_structure: "材料行",
		task_translate: "翻訳",
		task_adapt: "アレンジ",
		saved: "保存しました。",
		importNoAi: "AIがオフのため、レシピデータを含むページだけをインポートでき、材料行は確認画面で手動で対応付けます。"
	}
};
function He(e) {
	let t = (e?.locale?.language || e?.language || "en").split("-")[0];
	return Ve[t] ? t : "en";
}
function Ue(e) {
	let t = Ve[e], n = (e, n = {}) => String(t[e] ?? Ve.en[e] ?? e).replace(/\{(\w+)\}/g, (e, t) => n[t] ?? ""), r = new Intl.DisplayNames([e], { type: "language" });
	return n.langName = (e) => {
		try {
			return r.of(e);
		} catch {
			return e.toUpperCase();
		}
	}, n.status = (e) => t.status[e] || e, n.action = (e) => t.action[e] || e, n;
}
// src/transport.js
function We(e) {
	return {
		async call(t, n = {}) {
			try {
				return (await e().callWS({
					type: "call_service",
					domain: "itadaki",
					service: t,
					service_data: n,
					return_response: !0
				})).response;
			} catch (e) {
				throw Object.assign(Error(e?.message || String(e)), { key: e?.translation_key });
			}
		},
		subscribeDrafts(t) {
			return e().connection.subscribeMessage(t, { type: "itadaki/subscribe_drafts" });
		}
	};
}
// src/router.js
var Ge = ["ingredients", "units"];
function Ke({ view: e, id: t }) {
	switch (e) {
		case "recipe": return `/recipe/${t}`;
		case "edit": return `/recipe/${t}/edit`;
		case "draft": return `/draft/${t}`;
		case "new": return "/new";
		case "import": return "/import";
		case "manage": return "/manage";
		case "languages": return "/manage/languages";
		case "ai": return "/manage/ai";
		case "catalog": return `/manage/${t}`;
		default: return "";
	}
}
function qe(e = "") {
	let [, t, n, r] = e.split("/");
	return t === "recipe" && n ? r === "edit" ? {
		view: "edit",
		id: n
	} : {
		view: "recipe",
		id: n
	} : t === "draft" && n ? {
		view: "draft",
		id: n
	} : t === "new" ? { view: "new" } : t === "import" ? { view: "import" } : t === "manage" && (n === "languages" || n === "ai") ? { view: n } : t === "manage" ? Ge.includes(n) ? {
		view: "catalog",
		id: n
	} : { view: "manage" } : { view: "list" };
}
function Je(e, t, n = !1) {
	let r = history.state?.itadakiDepth ?? 0, i = e + Ke(t);
	n ? history.replaceState({ itadakiDepth: r }, "", i) : history.pushState({ itadakiDepth: r + 1 }, "", i), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: n } })), window.scrollTo(0, 0);
}
function Ye(e) {
	(history.state?.itadakiDepth ?? 0) > 0 ? history.back() : Je(e, { view: "list" }, !0);
}
function k(e, t) {
	e.dispatchEvent(new CustomEvent("navigate", {
		detail: t,
		bubbles: !0,
		composed: !0
	}));
}
// src/icons.js
var Xe = {
	back: "M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",
	menu: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
	cog: "M19.14 12.94c.04-.31.06-.62.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.48.48 0 0 0 13.92 2h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.72 8.47a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.07.63-.07.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.48.48 0 0 0-.12-.61zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z",
	edit: "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",
	adapt: "M7.5,5.6L5,7L6.4,4.5L5,2L7.5,3.4L10,2L8.6,4.5L10,7L7.5,5.6M19.5,15.4L22,14L20.6,16.5L22,19L19.5,17.6L17,19L18.4,16.5L17,14L19.5,15.4M22,2L20.6,4.5L22,7L19.5,5.6L17,7L18.4,4.5L17,2L19.5,3.4L22,2M13.34,12.78L15.78,10.34L13.66,8.22L11.22,10.66L13.34,12.78M14.37,7.29L16.71,9.63C17.1,10 17.1,10.65 16.71,11.04L5.04,22.71C4.65,23.1 4,23.1 3.63,22.71L1.29,20.37C0.9,20 0.9,19.35 1.29,18.96L12.96,7.29C13.35,6.9 14,6.9 14.37,7.29Z",
	delete: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
	translate: "M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07M18.5,10H16.5L12,22H14L15.12,19H19.87L21,22H23L18.5,10M15.88,17L17.5,12.67L19.12,17H15.88Z",
	list: "M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z",
	ruler: "M1.39,18.36L3.16,16.6L4.58,18L5.64,16.95L4.22,15.54L5.64,14.12L8.11,16.6L9.17,15.54L6.7,13.06L8.11,11.65L9.53,13.06L10.59,12L9.17,10.59L10.59,9.17L13.06,11.65L14.12,10.59L11.65,8.11L13.06,6.7L14.47,8.11L15.54,7.05L14.12,5.64L15.54,4.22L18,6.7L19.07,5.64L16.6,3.16L18.36,1.39L22.61,5.64L5.64,22.61L1.39,18.36Z",
	chevron: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",
	check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
	close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
}, Ze = (e) => xe`<svg viewBox="0 0 24 24" aria-hidden="true"><path d=${Xe[e]} /></svg>`, Qe = class extends D {
	static properties = {
		t: { attribute: !1 },
		header: {},
		home: { type: Boolean },
		narrow: { type: Boolean }
	};
	static styles = [O, o`
      :host { display: block; }
      header {
        position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 4px;
        height: var(--header-height, 56px); padding: 0 4px;
        background: var(--app-header-background-color, var(--primary-background-color));
        color: var(--app-header-text-color, var(--it-text));
        border-bottom: var(--app-header-border-bottom, none);
      }
      .title { flex: 1; min-width: 0; font-size: 1.25rem; margin-left: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .actions { display: flex; }
      main { max-width: 1100px; margin: 0 auto; padding: 16px; }
    `];
	render() {
		let e = this.t, t = E;
		return this.home ? this.narrow && (t = T`<button class="icon" aria-label="Menu"
        @click=${() => this.dispatchEvent(new Event("hass-toggle-menu", {
			bubbles: !0,
			composed: !0
		}))}>${Ze("menu")}</button>`) : t = T`<button class="icon" @click=${() => k(this, { view: "back" })} aria-label=${e("back")} title=${e("back")}>${Ze("back")}</button>`, T`
      <header>
        ${t}
        <span class="title">${this.header ?? ""}</span>
        <div class="actions"><slot name="actions"></slot></div>
      </header>
      <main><slot></slot></main>
    `;
	}
};
customElements.define("itadaki-page", Qe);
// src/views/text.js
var $e = class extends D {
	static properties = {
		value: {},
		placeholder: {},
		type: {},
		invalid: {
			type: Boolean,
			reflect: !0
		}
	};
	static styles = [O, o`
      :host { display: block; position: relative; min-width: 0; }
      input { padding-right: 34px; }
      :host([invalid]) input { border-color: var(--it-error); }
      .clear {
        position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
        width: 24px; height: 24px; border-radius: 50%; border: none; cursor: pointer;
        background: var(--it-soft); color: var(--it-muted); font-size: 0.9rem; line-height: 1;
      }
      .clear:hover { color: var(--it-text); }
      .clear { visibility: hidden; }
      :host(:hover) .clear, :host(:focus-within) .clear { visibility: visible; }
    `];
	constructor() {
		super(), this.value = "", this.type = "text";
	}
	_input(e) {
		this.value = e.target.value;
	}
	_change() {
		this.dispatchEvent(new Event("change", {
			bubbles: !0,
			composed: !0
		}));
	}
	_clear() {
		this.value = "", this.dispatchEvent(new Event("input", {
			bubbles: !0,
			composed: !0
		})), this._change(), this.renderRoot.querySelector("input").focus();
	}
	render() {
		return T`
      <input type=${this.type} .value=${this.value ?? ""} placeholder=${this.placeholder ?? ""}
        @input=${this._input} @change=${this._change} />
      ${this.value ? T`<button class="clear" tabindex="-1" aria-label="Clear" @click=${this._clear}>✕</button>` : E}
    `;
	}
};
customElements.define("itadaki-text", $e);
// src/drafts.js
function et(e, t) {
	let n = t.request || {}, r = [];
	if (t.action === "translate" && n.language && r.push(`→ ${e.langName(n.language)}`), t.action === "adapt" && n.instruction && r.push(`“${n.instruction}”`), t.action === "adapt" && n.as_variant && r.push(e("asNewVariant")), t.action === "import" && n.url) try {
		r.push(new URL(n.url).hostname.replace(/^www\./, ""));
	} catch {
		r.push(n.url);
	}
	return n.note && r.push(`“${n.note}”`), r.join(" · ");
}
// src/views/list.js
var tt = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		narrow: { type: Boolean },
		admin: { type: Boolean },
		_recipes: { state: !0 },
		_drafts: { state: !0 },
		_query: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O, o`
      .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
      .recipe { cursor: pointer; display: flex; flex-direction: column; gap: 8px; min-height: 96px; }
      .recipe:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
      .recipe .name { font-weight: 600; font-size: 1.05rem; }
      .tools { display: flex; gap: 12px; margin-bottom: 20px; }
      .tools input { flex: 1; }
      .inbox { margin-bottom: 24px; }
      .request { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .photo { padding: 0 0 16px; overflow: hidden; }
      .photo > :not(img):not(.placeholder) { padding: 0 16px; }
      .photo img, .photo .placeholder { width: 100%; height: 150px; object-fit: cover; display: block; margin-bottom: 4px; }
      .photo .placeholder { background: linear-gradient(135deg, var(--it-soft), transparent); }
      .chip.ready { background: var(--it-accent); color: var(--it-on-accent); }
      .chip.failed { background: color-mix(in srgb, var(--it-error) 18%, transparent); }
    `];
	connectedCallback() {
		super.connectedCallback(), this._query = "", this._load(), this._loadDrafts(), this._unsubscribe = this.api.subscribeDrafts((e) => {
			this._loadDrafts(), e.status === "saved" && this._load();
		});
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._unsubscribe?.then((e) => e());
	}
	async _load() {
		try {
			let e = await this.api.call("list_recipes", {
				prefer_language: this.lang,
				query: this._query || void 0
			});
			this._recipes = e.recipes, this._error = void 0;
		} catch (e) {
			this._error = e.message;
		}
	}
	async _loadDrafts() {
		try {
			this._drafts = (await this.api.call("list_drafts")).drafts;
		} catch (e) {
			this._error = e.message;
		}
	}
	_search(e) {
		this._query = e.target.value, clearTimeout(this._timer), this._timer = setTimeout(() => this._load(), 250);
	}
	_open(e) {
		k(this, {
			view: "recipe",
			id: e
		});
	}
	render() {
		let e = this.t;
		return T`<itadaki-page .t=${e} header=${e("recipes")} home ?narrow=${this.narrow}>
      ${this.admin ? T`<button slot="actions" class="icon" @click=${() => k(this, { view: "manage" })} aria-label=${e("manage")} title=${e("manage")}>
            ${Ze("cog")}</button>` : E}
      <div class="tools">
        <itadaki-text style="flex:1" .value=${this._query} placeholder=${e("search")} @input=${this._search}></itadaki-text>
        <button class="btn" @click=${() => k(this, { view: "new" })}>${e("newRecipe")}</button>
        <button class="btn" @click=${() => k(this, { view: "import" })}>${e("import")}</button>
      </div>
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
      ${this._drafts?.length ? T`<h2>${e("drafts")}</h2>
            <div class="grid inbox">
              ${this._drafts.map((t) => T`
                  <div class="card recipe" @click=${() => k(this, {
			view: "draft",
			id: t.id
		})}>
                    <div class="name">${t.title}</div>
                    ${et(e, t) ? T`<div class="muted request">${et(e, t)}</div>` : E}
                    <div class="row">
                      <span class="chip">${e.action(t.action)}</span>
                      <span class="chip ${t.status}">${e.status(t.status)}</span>
                    </div>
                  </div>
                `)}
            </div>
            <h2>${e("recipes")}</h2>` : E}
      ${this._recipes?.length === 0 && !this._query ? T`<p class="muted">${e("empty")}</p>` : E}
      <div class="grid">
        ${(this._recipes || []).map((t) => T`
            <div class="card recipe photo" @click=${() => this._open(t.id)}>
              ${t.image_url ? T`<img src=${t.image_url} alt="" loading="lazy" referrerpolicy="no-referrer" />` : T`<div class="placeholder"></div>`}
              <div class="name">${t.title}</div>
              <div class="row">
                ${t.language === this.lang ? E : T`<span class="chip">${e.langName(t.language)}</span>`}
                ${t.relation === "variant" ? T`<span class="chip">${e("variant")}</span>` : E}
              </div>
            </div>
          `)}
      </div>
    </itadaki-page>`;
	}
};
customElements.define("itadaki-list", tt);
// src/views/body.js
function nt(e, t) {
	let n = [];
	return e.forEach((e, r) => {
		let i = t(e, r) || "", a = n[n.length - 1];
		a && a.section === i ? a.items.push(e) : n.push({
			section: i,
			items: [e]
		});
	}), n;
}
var rt = class extends D {
	static properties = {
		recipe: { attribute: !1 },
		lines: { attribute: !1 },
		t: { attribute: !1 }
	};
	static styles = [O, o`
      :host { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
      @media (max-width: 800px) { :host { grid-template-columns: minmax(0, 1fr); } }
      ul { margin: 0; padding-left: 20px; }
      li { margin: 6px 0; }
      ol { margin: 0; padding-left: 22px; }
      ol li { margin: 10px 0; line-height: 1.5; }
      h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--it-muted); margin: 16px 0 4px; }
      .notes { grid-column: 1 / -1; white-space: pre-wrap; }
    `];
	render() {
		let { recipe: e, lines: t, t: n } = this, r = nt(t, (t, n) => e.ingredients[n]?.section), i = nt(e.steps, (e) => e.section);
		return T`
      <div class="card">
        <h2>${n("ingredients")}</h2>
        ${r.map((e) => T`${e.section ? T`<h3>${e.section}</h3>` : E}
            <ul>${e.items.map((e) => T`<li>${e}</li>`)}</ul>`)}
      </div>
      <div class="card">
        <h2>${n("steps")}</h2>
        ${i.map((e) => T`${e.section ? T`<h3>${e.section}</h3>` : E}
            <ol>${e.items.map((e) => T`<li>${e.text}</li>`)}</ol>`)}
      </div>
      ${e.notes ? T`<div class="card notes"><h2>${n("notes")}</h2>${e.notes}</div>` : E}
    `;
	}
};
customElements.define("itadaki-body", rt);
// src/views/busy.js
var it = class extends D {
	static properties = { text: {} };
	static styles = [O, o`
      :host { display: flex; align-items: center; gap: 12px; padding: 16px 0; }
      .spinner {
        width: 22px; height: 22px; border-radius: 50%;
        border: 3px solid var(--it-soft); border-top-color: var(--it-accent);
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `];
	render() {
		return T`<div class="spinner"></div><span class="muted">${this.text}</span>`;
	}
};
customElements.define("itadaki-busy", it);
// src/views/menu.js
var at = class extends D {
	static properties = {
		icon: {},
		label: {},
		items: { attribute: !1 },
		disabled: { type: Boolean },
		_open: { state: !0 }
	};
	static styles = [O, o`
      :host { position: relative; display: block; }
      .list {
        position: absolute; right: 0; top: 100%; z-index: 3; min-width: 200px; padding: 6px 0;
        background: var(--it-surface); color: var(--it-text); border-radius: 12px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
      }
      .item {
        display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 16px;
        background: none; border: none; font: inherit; color: inherit; text-align: left; cursor: pointer; white-space: nowrap;
      }
      .item:hover { background: var(--it-soft); }
      .mark { width: 20px; height: 20px; display: flex; fill: var(--it-accent); }
      hr { border: none; border-top: 1px solid var(--it-divider); margin: 6px 0; }
    `];
	constructor() {
		super(), this._close = (e) => {
			e.composedPath().includes(this) || (this._open = !1);
		};
	}
	connectedCallback() {
		super.connectedCallback(), document.addEventListener("click", this._close);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), document.removeEventListener("click", this._close);
	}
	_pick(e) {
		this._open = !1, e.run();
	}
	render() {
		return T`
      <button class="icon" ?disabled=${this.disabled} aria-label=${this.label} title=${this.label}
        @click=${() => this._open = !this._open}>${Ze(this.icon)}</button>
      ${this._open ? T`<div class="list">
            ${this.items.map((e) => e === "-" ? T`<hr />` : T`<button class="item" @click=${() => this._pick(e)}>
                    <span class="mark">${e.active ? Ze("check") : E}</span>${e.label}</button>`)}
          </div>` : E}
    `;
	}
};
customElements.define("itadaki-menu", at);
// src/views/recipe.js
var ot = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		languages: { attribute: !1 },
		ai: { type: Boolean },
		recipeId: {},
		_data: { state: !0 },
		_servings: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 },
		_adapting: { state: !0 },
		_drafts: { state: !0 }
	};
	static styles = [O, o`
      .hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 16px; }
      .hero img { width: 180px; height: 135px; object-fit: cover; border-radius: var(--it-radius); flex-shrink: 0; }
      @media (max-width: 600px) { .hero { flex-direction: column; } .hero img { width: 100%; height: 200px; } }
      h1 { margin: 0 0 8px; font-size: 1.6rem; }
      .meta { margin: 8px 0; }
      .stepper { display: inline-flex; align-items: center; gap: 8px; }
      .stepper button { width: 32px; height: 32px; padding: 0; }
      .adapt { margin-bottom: 16px; }
      .variants { margin-top: 16px; }
      .drafts { margin-bottom: 16px; }
      .draft { display: flex; gap: 10px; align-items: center; width: 100%; text-align: left; font: inherit;
        color: inherit; background: none; border: none; padding: 8px 0; cursor: pointer; }
      .draft:hover { color: var(--it-accent); }
      .chip.ready { background: var(--it-accent); color: var(--it-on-accent); }
      .chip.failed { background: color-mix(in srgb, var(--it-error) 18%, transparent); }
      a { color: var(--it-accent); }
    `];
	connectedCallback() {
		super.connectedCallback(), this._unsubscribe = this.api.subscribeDrafts(() => this._loadDrafts());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._unsubscribe?.then((e) => e());
	}
	updated(e) {
		e.has("recipeId") && (this._servings = void 0, this._adapting = !1, this._load(), this._loadDrafts());
	}
	async _loadDrafts() {
		try {
			this._drafts = (await this.api.call("list_drafts", { recipe_id: this.recipeId })).drafts;
		} catch {
			this._drafts = [];
		}
	}
	async _load() {
		try {
			this._data = await this.api.call("get_recipe", {
				recipe_id: this.recipeId,
				...this._servings ? { servings: this._servings } : {}
			}), this._error = void 0;
		} catch (e) {
			this._error = e.message;
		}
	}
	_scale(e) {
		let t = this._servings || this._data.recipe.servings;
		this._servings = Math.max(1, t + e), this._load();
	}
	async _ai(e, t) {
		this._busy = !0, this._error = void 0;
		try {
			let { draft_id: n } = await this.api.call(e, t);
			k(this, {
				view: "draft",
				id: n
			});
		} catch (e) {
			this._error = e.message;
		} finally {
			this._busy = !1;
		}
	}
	async _delete() {
		if (confirm(this.t("confirmDelete"))) {
			try {
				await this.api.call("delete_recipe", { recipe_id: this.recipeId });
			} catch (e) {
				if (e.key !== "in_use") {
					this._error = e.message;
					return;
				}
				if (!confirm(this.t("confirmDeleteAll"))) return;
				try {
					await this.api.call("delete_recipe", {
						recipe_id: this.recipeId,
						cascade: !0
					});
				} catch (e) {
					this._error = e.message;
					return;
				}
			}
			k(this, {
				view: "list",
				replace: !0
			});
		}
	}
	render() {
		return T`<itadaki-page .t=${this.t}>${this._data ? this._actions() : E}${this._content()}</itadaki-page>`;
	}
	_actions() {
		let e = this.t, { recipe: t, translations: n } = this._data, r = [{
			id: t.id,
			language: t.language
		}, ...n].sort((e, t) => e.language.localeCompare(t.language)), i = this.ai ? this.languages.filter((e) => !r.some((t) => t.language === e)) : [], a = [
			...r.map((n) => ({
				label: e.langName(n.language),
				active: n.id === t.id,
				run: () => n.id !== t.id && k(this, {
					view: "recipe",
					id: n.id,
					replace: !0
				})
			})),
			...i.length ? ["-"] : [],
			...i.map((n) => ({
				label: e("translateTo", { lang: e.langName(n) }),
				run: () => this._ai("translate", {
					recipe_id: t.id,
					language: n
				})
			}))
		], o = (e, t, n) => T`<button slot="actions" class="icon" ?disabled=${this._busy}
      aria-label=${t} title=${t} @click=${n}>${Ze(e)}</button>`;
		return T`
      ${a.length > 1 ? T`<itadaki-menu slot="actions" icon="translate" label=${e("language")} .items=${a} ?disabled=${this._busy}></itadaki-menu>` : E}
      ${o("edit", e("edit"), () => k(this, {
			view: "edit",
			id: t.id
		}))}
      ${this.ai ? o("adapt", e("adapt"), () => this._adapting = !this._adapting) : E}
      ${o("delete", e("delete"), this._delete)}
    `;
	}
	_content() {
		let e = this.t;
		if (!this._data) return this._error ? T`<div class="error">${this._error}</div>` : T`<itadaki-busy></itadaki-busy>`;
		let { recipe: t, lines_text: n, variants: r, stale: i, parent: a } = this._data, o = t.total_minutes || (t.prep_minutes || 0) + (t.cook_minutes || 0);
		return T`
      <div class="hero">
        ${t.image_url ? T`<img src=${t.image_url} alt="" referrerpolicy="no-referrer" />` : E}
        <div>
          <h1>${t.title}</h1>
          ${t.description ? T`<div class="muted">${t.description}</div>` : E}
          <div class="row meta">
            <span class="chip">${e.langName(t.language)}</span>
            ${t.relation === "variant" && a ? T`<button class="chip" @click=${() => k(this, {
			view: "recipe",
			id: a.id
		})}>
                  ${e("variant")}: ${a.title}</button>` : E}
            ${o ? T`<span class="chip">${e("minutes", { n: o })}</span>` : E}
            ${t.servings ? T`<span class="stepper">
                  <button class="btn quiet" @click=${() => this._scale(-1)}>−</button>
                  <span>${t.servings} ${e("servings")}</span>
                  <button class="btn quiet" @click=${() => this._scale(1)}>+</button>
                </span>` : E}
          </div>
          ${t.source_url ? T`<div class="muted"><a href=${t.source_url} target="_blank" rel="noreferrer">${e("source")}</a></div>` : E}
        </div>
      </div>

      ${i ? T`<div class="banner row">${e("stale")}
            ${this.ai ? T`<button class="btn quiet" ?disabled=${this._busy}
                  @click=${() => this._ai("translate", {
			recipe_id: a.id,
			language: t.language
		})}>${e("retranslate")}</button>` : E}
          </div>` : E}

      ${this._adapting ? this._renderAdapt() : E}
      ${this._drafts?.length ? T`<div class="card drafts">
            <h2>${e("inProgress")}</h2>
            ${this._drafts.map((t) => T`<button class="draft" @click=${() => k(this, {
			view: "draft",
			id: t.id
		})}>
                <span class="chip ${t.status}">${e.status(t.status)}</span>
                <span>${e.action(t.action)}${et(e, t) ? ` · ${et(e, t)}` : ""}</span>
              </button>`)}
          </div>` : E}
      ${this._busy ? T`<itadaki-busy .text=${e("working")}></itadaki-busy>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}

      <itadaki-body .recipe=${t} .lines=${n} .t=${e}></itadaki-body>

      ${r.length ? T`<div class="card variants">
            <h2>${e("variants")}</h2>
            <div class="row">${r.map((e) => T`<button class="chip" @click=${() => k(this, {
			view: "recipe",
			id: e.id
		})}>${e.title}</button>`)}</div>
          </div>` : E}
    `;
	}
	_renderAdapt() {
		let e = this.t;
		return T`
      <div class="card adapt">
        <textarea id="instruction" rows="2" placeholder=${e("adaptHint")}></textarea>
        <div class="row" style="margin-top:12px;justify-content:space-between">
          <label class="row" style="margin:0"><input type="checkbox" id="variant" /> ${e("asVariant")}</label>
          <button class="btn" ?disabled=${this._busy} @click=${() => {
			let e = this.renderRoot.querySelector("#instruction").value.trim();
			if (!e) return;
			let t = this.renderRoot.querySelector("#variant").checked;
			this._ai("adapt", {
				recipe_id: this.recipeId,
				instruction: e,
				as_variant: t
			});
		}}>${e("run")}</button>
        </div>
      </div>
    `;
	}
};
customElements.define("itadaki-recipe", ot);
// src/views/import.js
var st = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		ai: { type: Boolean },
		_busy: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O];
	async _run(e) {
		e.preventDefault();
		let t = this.renderRoot.querySelector("#url").value.trim(), n = this.renderRoot.querySelector("#note")?.value.trim();
		if (t) {
			this._busy = !0, this._error = void 0;
			try {
				let { draft_id: e } = await this.api.call("import_url", {
					url: t,
					...n ? { note: n } : {}
				});
				k(this, {
					view: "draft",
					id: e
				});
			} catch (e) {
				this._error = e.message;
			} finally {
				this._busy = !1;
			}
		}
	}
	render() {
		let e = this.t;
		return T`<itadaki-page .t=${e} header=${e("import")}>
      <form class="card" @submit=${this._run}>
        <h2>${e("importTitle")}</h2>
        <label for="url">${e("url")}</label>
        <itadaki-text id="url" type="url" placeholder="https://"></itadaki-text>
        ${this.ai ? T`<label for="note">${e("note")}</label>
              <textarea id="note" rows="2" placeholder=${e("noteHint")} ?disabled=${this._busy}></textarea>` : T`<div class="muted" style="margin-top:12px">${e("importNoAi")}</div>`}
        <div class="row" style="margin-top:16px">
          <button class="btn" type="submit" ?disabled=${this._busy}>${e("import")}</button>
        </div>
        ${this._busy ? T`<itadaki-busy .text=${e("working")}></itadaki-busy>` : E}
        ${this._error ? T`<div class="error">${this._error}</div>` : E}
      </form>
    </itadaki-page>`;
	}
};
customElements.define("itadaki-import", st);
// node_modules/lit-html/directive.js
var ct = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, lt = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), ut = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, { I: dt } = Ie, ft = (e) => e, pt = () => document.createComment(""), mt = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new dt(r.insertBefore(pt(), i), r.insertBefore(pt(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = ft(e).nextSibling;
				ft(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, ht = (e, t, n = e) => (e._$AI(t, n), e), gt = {}, _t = (e, t = gt) => e._$AH = t, vt = (e) => e._$AH, yt = (e) => {
	e._$AR(), e._$AA.remove();
}, bt = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, xt = lt(class extends ut {
	constructor(e) {
		if (super(e), e.type !== ct.CHILD) throw Error("repeat() can only be used in text expressions");
	}
	dt(e, t, n) {
		let r;
		n === void 0 ? n = t : t !== void 0 && (r = t);
		let i = [], a = [], o = 0;
		for (let t of e) i[o] = r ? r(t, o) : o, a[o] = n(t, o), o++;
		return {
			values: a,
			keys: i
		};
	}
	render(e, t, n) {
		return this.dt(e, t, n).values;
	}
	update(e, [t, n, r]) {
		let i = vt(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = ht(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = ht(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = ht(i[d], a[m]), mt(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = ht(i[f], a[p]), mt(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = bt(o, p, m), u = bt(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = mt(e, i[d]);
					ht(t, a[p]), c[p] = t;
				} else c[p] = ht(n, a[p]), mt(e, i[d], n), i[t] = null;
				p++;
			} else yt(i[f]), f--;
		} else yt(i[d]), d++;
		for (; p <= m;) {
			let t = mt(e, c[m + 1]);
			ht(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && yt(e);
		}
		return this.ut = o, _t(e, c), Se;
	}
});
// node_modules/sortablejs/modular/sortable.esm.js
function St(e, t, n) {
	return (t = Ot(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Ct() {
	return Ct = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Ct.apply(null, arguments);
}
function wt(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function A(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? wt(Object(n), !0).forEach(function(t) {
			St(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wt(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Tt(e, t) {
	if (e == null) return {};
	var n, r, i = Et(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Et(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function Dt(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Ot(e) {
	var t = Dt(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function kt(e) {
	"@babel/helpers - typeof";
	return kt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, kt(e);
}
var At = "1.15.7";
function jt(e) {
	if (typeof window < "u" && window.navigator) return !!/*@__PURE__*/ navigator.userAgent.match(e);
}
var Mt = jt(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i), Nt = jt(/Edge/i), Pt = jt(/firefox/i), Ft = jt(/safari/i) && !jt(/chrome/i) && !jt(/android/i), It = jt(/iP(ad|od|hone)/i), Lt = jt(/chrome/i) && jt(/android/i), Rt = {
	capture: !1,
	passive: !1
};
function j(e, t, n) {
	e.addEventListener(t, n, !Mt && Rt);
}
function M(e, t, n) {
	e.removeEventListener(t, n, !Mt && Rt);
}
function zt(e, t) {
	if (t) {
		if (t[0] === ">" && (t = t.substring(1)), e) try {
			if (e.matches) return e.matches(t);
			if (e.msMatchesSelector) return e.msMatchesSelector(t);
			if (e.webkitMatchesSelector) return e.webkitMatchesSelector(t);
		} catch {
			return !1;
		}
		return !1;
	}
}
function Bt(e) {
	return e.host && e !== document && e.host.nodeType && e.host !== e ? e.host : e.parentNode;
}
function N(e, t, n, r) {
	if (e) {
		n ||= document;
		do {
			if (t != null && (t[0] === ">" ? e.parentNode === n && zt(e, t) : zt(e, t)) || r && e === n) return e;
			if (e === n) break;
		} while (e = Bt(e));
	}
	return null;
}
var Vt = /\s+/g;
function P(e, t, n) {
	e && t && (e.classList ? e.classList[n ? "add" : "remove"](t) : e.className = ((" " + e.className + " ").replace(Vt, " ").replace(" " + t + " ", " ") + (n ? " " + t : "")).replace(Vt, " "));
}
function F(e, t, n) {
	var r = e && e.style;
	if (r) {
		if (n === void 0) return document.defaultView && document.defaultView.getComputedStyle ? n = document.defaultView.getComputedStyle(e, "") : e.currentStyle && (n = e.currentStyle), t === void 0 ? n : n[t];
		!(t in r) && t.indexOf("webkit") === -1 && (t = "-webkit-" + t), r[t] = n + (typeof n == "string" ? "" : "px");
	}
}
function Ht(e, t) {
	var n = "";
	if (typeof e == "string") n = e;
	else do {
		var r = F(e, "transform");
		r && r !== "none" && (n = r + " " + n);
	} while (!t && (e = e.parentNode));
	var i = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
	return i && new i(n);
}
function Ut(e, t, n) {
	if (e) {
		var r = e.getElementsByTagName(t), i = 0, a = r.length;
		if (n) for (; i < a; i++) n(r[i], i);
		return r;
	}
	return [];
}
function I() {
	return document.scrollingElement || document.documentElement;
}
function L(e, t, n, r, i) {
	if (e.getBoundingClientRect || e === window) {
		var a, o, s, c, l, u, d;
		if (e !== window && e.parentNode && e !== I() ? (a = e.getBoundingClientRect(), o = a.top, s = a.left, c = a.bottom, l = a.right, u = a.height, d = a.width) : (o = 0, s = 0, c = window.innerHeight, l = window.innerWidth, u = window.innerHeight, d = window.innerWidth), (t || n) && e !== window && (i ||= e.parentNode, !Mt)) do
			if (i && i.getBoundingClientRect && (F(i, "transform") !== "none" || n && F(i, "position") !== "static")) {
				var f = i.getBoundingClientRect();
				o -= f.top + parseInt(F(i, "border-top-width")), s -= f.left + parseInt(F(i, "border-left-width")), c = o + a.height, l = s + a.width;
				break;
			}
		while (i = i.parentNode);
		if (r && e !== window) {
			var p = Ht(i || e), m = p && p.a, h = p && p.d;
			p && (o /= h, s /= m, d /= m, u /= h, c = o + u, l = s + d);
		}
		return {
			top: o,
			left: s,
			bottom: c,
			right: l,
			width: d,
			height: u
		};
	}
}
function Wt(e, t, n) {
	for (var r = Yt(e, !0), i = L(e)[t]; r;) {
		var a = L(r)[n], o = void 0;
		if (o = n === "top" || n === "left" ? i >= a : i <= a, !o) return r;
		if (r === I()) break;
		r = Yt(r, !1);
	}
	return !1;
}
function Gt(e, t, n, r) {
	for (var i = 0, a = 0, o = e.children; a < o.length;) {
		if (o[a].style.display !== "none" && o[a] !== Z.ghost && (r || o[a] !== Z.dragged) && N(o[a], n.draggable, e, !1)) {
			if (i === t) return o[a];
			i++;
		}
		a++;
	}
	return null;
}
function Kt(e, t) {
	for (var n = e.lastElementChild; n && (n === Z.ghost || F(n, "display") === "none" || t && !zt(n, t));) n = n.previousElementSibling;
	return n || null;
}
function R(e, t) {
	var n = 0;
	if (!e || !e.parentNode) return -1;
	for (; e = e.previousElementSibling;) e.nodeName.toUpperCase() !== "TEMPLATE" && e !== Z.clone && (!t || zt(e, t)) && n++;
	return n;
}
function qt(e) {
	var t = 0, n = 0, r = I();
	if (e) do {
		var i = Ht(e), a = i.a, o = i.d;
		t += e.scrollLeft * a, n += e.scrollTop * o;
	} while (e !== r && (e = e.parentNode));
	return [t, n];
}
function Jt(e, t) {
	for (var n in e) if (e.hasOwnProperty(n)) {
		for (var r in t) if (t.hasOwnProperty(r) && t[r] === e[n][r]) return Number(n);
	}
	return -1;
}
function Yt(e, t) {
	if (!e || !e.getBoundingClientRect) return I();
	var n = e, r = !1;
	do
		if (n.clientWidth < n.scrollWidth || n.clientHeight < n.scrollHeight) {
			var i = F(n);
			if (n.clientWidth < n.scrollWidth && (i.overflowX == "auto" || i.overflowX == "scroll") || n.clientHeight < n.scrollHeight && (i.overflowY == "auto" || i.overflowY == "scroll")) {
				if (!n.getBoundingClientRect || n === document.body) return I();
				if (r || t) return n;
				r = !0;
			}
		}
	while (n = n.parentNode);
	return I();
}
function Xt(e, t) {
	if (e && t) for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
	return e;
}
function Zt(e, t) {
	return Math.round(e.top) === Math.round(t.top) && Math.round(e.left) === Math.round(t.left) && Math.round(e.height) === Math.round(t.height) && Math.round(e.width) === Math.round(t.width);
}
var Qt;
function $t(e, t) {
	return function() {
		if (!Qt) {
			var n = arguments, r = this;
			n.length === 1 ? e.call(r, n[0]) : e.apply(r, n), Qt = setTimeout(function() {
				Qt = void 0;
			}, t);
		}
	};
}
function en() {
	clearTimeout(Qt), Qt = void 0;
}
function tn(e, t, n) {
	e.scrollLeft += t, e.scrollTop += n;
}
function nn(e) {
	var t = window.Polymer, n = window.jQuery || window.Zepto;
	return t && t.dom ? t.dom(e).cloneNode(!0) : n ? n(e).clone(!0)[0] : e.cloneNode(!0);
}
function rn(e, t, n) {
	var r = {};
	return Array.from(e.children).forEach(function(i) {
		if (N(i, t.draggable, e, !1) && !i.animated && i !== n) {
			var a = L(i);
			r.left = Math.min(r.left ?? Infinity, a.left), r.top = Math.min(r.top ?? Infinity, a.top), r.right = Math.max(r.right ?? -Infinity, a.right), r.bottom = Math.max(r.bottom ?? -Infinity, a.bottom);
		}
	}), r.width = r.right - r.left, r.height = r.bottom - r.top, r.x = r.left, r.y = r.top, r;
}
var z = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
function an() {
	var e = [], t;
	return {
		captureAnimationState: function() {
			e = [], this.options.animation && [].slice.call(this.el.children).forEach(function(t) {
				if (F(t, "display") !== "none" && t !== Z.ghost) {
					e.push({
						target: t,
						rect: L(t)
					});
					var n = A({}, e[e.length - 1].rect);
					if (t.thisAnimationDuration) {
						var r = Ht(t, !0);
						r && (n.top -= r.f, n.left -= r.e);
					}
					t.fromRect = n;
				}
			});
		},
		addAnimationState: function(t) {
			e.push(t);
		},
		removeAnimationState: function(t) {
			e.splice(Jt(e, { target: t }), 1);
		},
		animateAll: function(n) {
			var r = this;
			if (!this.options.animation) clearTimeout(t), typeof n == "function" && n();
			else {
				var i = !1, a = 0;
				e.forEach(function(e) {
					var t = 0, n = e.target, o = n.fromRect, s = L(n), c = n.prevFromRect, l = n.prevToRect, u = e.rect, d = Ht(n, !0);
					d && (s.top -= d.f, s.left -= d.e), n.toRect = s, n.thisAnimationDuration && Zt(c, s) && !Zt(o, s) && (u.top - s.top) / (u.left - s.left) === (o.top - s.top) / (o.left - s.left) && (t = sn(u, c, l, r.options)), Zt(s, o) || (n.prevFromRect = o, n.prevToRect = s, t ||= r.options.animation, r.animate(n, u, s, t)), t && (i = !0, a = Math.max(a, t), clearTimeout(n.animationResetTimer), n.animationResetTimer = setTimeout(function() {
						n.animationTime = 0, n.prevFromRect = null, n.fromRect = null, n.prevToRect = null, n.thisAnimationDuration = null;
					}, t), n.thisAnimationDuration = t);
				}), clearTimeout(t), i ? t = setTimeout(function() {
					typeof n == "function" && n();
				}, a) : typeof n == "function" && n(), e = [];
			}
		},
		animate: function(e, t, n, r) {
			if (r) {
				F(e, "transition", ""), F(e, "transform", "");
				var i = Ht(this.el), a = i && i.a, o = i && i.d, s = (t.left - n.left) / (a || 1), c = (t.top - n.top) / (o || 1);
				e.animatingX = !!s, e.animatingY = !!c, F(e, "transform", "translate3d(" + s + "px," + c + "px,0)"), this.forRepaintDummy = on(e), F(e, "transition", "transform " + r + "ms" + (this.options.easing ? " " + this.options.easing : "")), F(e, "transform", "translate3d(0,0,0)"), typeof e.animated == "number" && clearTimeout(e.animated), e.animated = setTimeout(function() {
					F(e, "transition", ""), F(e, "transform", ""), e.animated = !1, e.animatingX = !1, e.animatingY = !1;
				}, r);
			}
		}
	};
}
function on(e) {
	return e.offsetWidth;
}
function sn(e, t, n, r) {
	return Math.sqrt((t.top - e.top) ** 2 + (t.left - e.left) ** 2) / Math.sqrt((t.top - n.top) ** 2 + (t.left - n.left) ** 2) * r.animation;
}
var cn = [], ln = { initializeByDefault: !0 }, un = {
	mount: function(e) {
		for (var t in ln) ln.hasOwnProperty(t) && !(t in e) && (e[t] = ln[t]);
		cn.forEach(function(t) {
			if (t.pluginName === e.pluginName) throw `Sortable: Cannot mount plugin ${e.pluginName} more than once`;
		}), cn.push(e);
	},
	pluginEvent: function(e, t, n) {
		var r = this;
		this.eventCanceled = !1, n.cancel = function() {
			r.eventCanceled = !0;
		};
		var i = e + "Global";
		cn.forEach(function(r) {
			t[r.pluginName] && (t[r.pluginName][i] && t[r.pluginName][i](A({ sortable: t }, n)), t.options[r.pluginName] && t[r.pluginName][e] && t[r.pluginName][e](A({ sortable: t }, n)));
		});
	},
	initializePlugins: function(e, t, n, r) {
		for (var i in cn.forEach(function(r) {
			var i = r.pluginName;
			if (e.options[i] || r.initializeByDefault) {
				var a = new r(e, t, e.options);
				a.sortable = e, a.options = e.options, e[i] = a, Ct(n, a.defaults);
			}
		}), e.options) if (e.options.hasOwnProperty(i)) {
			var a = this.modifyOption(e, i, e.options[i]);
			a !== void 0 && (e.options[i] = a);
		}
	},
	getEventProperties: function(e, t) {
		var n = {};
		return cn.forEach(function(r) {
			typeof r.eventProperties == "function" && Ct(n, r.eventProperties.call(t[r.pluginName], e));
		}), n;
	},
	modifyOption: function(e, t, n) {
		var r;
		return cn.forEach(function(i) {
			e[i.pluginName] && i.optionListeners && typeof i.optionListeners[t] == "function" && (r = i.optionListeners[t].call(e[i.pluginName], n));
		}), r;
	}
};
function dn(e) {
	var t = e.sortable, n = e.rootEl, r = e.name, i = e.targetEl, a = e.cloneEl, o = e.toEl, s = e.fromEl, c = e.oldIndex, l = e.newIndex, u = e.oldDraggableIndex, d = e.newDraggableIndex, f = e.originalEvent, p = e.putSortable, m = e.extraEventProperties;
	if (t ||= n && n[z], t) {
		var h, ee = t.options, g = "on" + r.charAt(0).toUpperCase() + r.substr(1);
		window.CustomEvent && !Mt && !Nt ? h = new CustomEvent(r, {
			bubbles: !0,
			cancelable: !0
		}) : (h = document.createEvent("Event"), h.initEvent(r, !0, !0)), h.to = o || n, h.from = s || n, h.item = i || n, h.clone = a, h.oldIndex = c, h.newIndex = l, h.oldDraggableIndex = u, h.newDraggableIndex = d, h.originalEvent = f, h.pullMode = p ? p.lastPutMode : void 0;
		var te = A(A({}, m), un.getEventProperties(r, t));
		for (var _ in te) h[_] = te[_];
		n && n.dispatchEvent(h), ee[g] && ee[g].call(t, h);
	}
}
var fn = ["evt"], B = function(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, r = n.evt, i = Tt(n, fn);
	un.pluginEvent.bind(Z)(e, t, A({
		dragEl: H,
		parentEl: U,
		ghostEl: W,
		rootEl: G,
		nextEl: pn,
		lastDownEl: mn,
		cloneEl: K,
		cloneHidden: hn,
		dragStarted: On,
		putSortable: J,
		activeSortable: Z.active,
		originalEvent: r,
		oldIndex: gn,
		oldDraggableIndex: _n,
		newIndex: q,
		newDraggableIndex: vn,
		hideGhostForTarget: Kn,
		unhideGhostForTarget: qn,
		cloneNowHidden: function() {
			hn = !0;
		},
		cloneNowShown: function() {
			hn = !1;
		},
		dispatchSortableEvent: function(e) {
			V({
				sortable: t,
				name: e,
				originalEvent: r
			});
		}
	}, i));
};
function V(e) {
	dn(A({
		putSortable: J,
		cloneEl: K,
		targetEl: H,
		rootEl: G,
		oldIndex: gn,
		oldDraggableIndex: _n,
		newIndex: q,
		newDraggableIndex: vn
	}, e));
}
var H, U, W, G, pn, mn, K, hn, gn, q, _n, vn, yn, J, bn = !1, xn = !1, Sn = [], Cn, Y, wn, Tn, En, Dn, On, kn, An, jn = !1, Mn = !1, Nn, X, Pn = [], Fn = !1, In = [], Ln = typeof document < "u", Rn = It, zn = Nt || Mt ? "cssFloat" : "float", Bn = Ln && !Lt && !It && "draggable" in document.createElement("div"), Vn = function() {
	if (Ln) {
		if (Mt) return !1;
		var e = document.createElement("x");
		return e.style.cssText = "pointer-events:auto", e.style.pointerEvents === "auto";
	}
}(), Hn = function(e, t) {
	var n = F(e), r = parseInt(n.width) - parseInt(n.paddingLeft) - parseInt(n.paddingRight) - parseInt(n.borderLeftWidth) - parseInt(n.borderRightWidth), i = Gt(e, 0, t), a = Gt(e, 1, t), o = i && F(i), s = a && F(a), c = o && parseInt(o.marginLeft) + parseInt(o.marginRight) + L(i).width, l = s && parseInt(s.marginLeft) + parseInt(s.marginRight) + L(a).width;
	if (n.display === "flex") return n.flexDirection === "column" || n.flexDirection === "column-reverse" ? "vertical" : "horizontal";
	if (n.display === "grid") return n.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
	if (i && o.float && o.float !== "none") {
		var u = o.float === "left" ? "left" : "right";
		return a && (s.clear === "both" || s.clear === u) ? "vertical" : "horizontal";
	}
	return i && (o.display === "block" || o.display === "flex" || o.display === "table" || o.display === "grid" || c >= r && n[zn] === "none" || a && n[zn] === "none" && c + l > r) ? "vertical" : "horizontal";
}, Un = function(e, t, n) {
	var r = n ? e.left : e.top, i = n ? e.right : e.bottom, a = n ? e.width : e.height, o = n ? t.left : t.top, s = n ? t.right : t.bottom, c = n ? t.width : t.height;
	return r === o || i === s || r + a / 2 === o + c / 2;
}, Wn = function(e, t) {
	var n;
	return Sn.some(function(r) {
		var i = r[z].options.emptyInsertThreshold;
		if (i && !Kt(r)) {
			var a = L(r), o = e >= a.left - i && e <= a.right + i, s = t >= a.top - i && t <= a.bottom + i;
			if (o && s) return n = r;
		}
	}), n;
}, Gn = function(e) {
	function t(e, n) {
		return function(r, i, a, o) {
			var s = r.options.group.name && i.options.group.name && r.options.group.name === i.options.group.name;
			if (e == null && (n || s)) return !0;
			if (e == null || e === !1) return !1;
			if (n && e === "clone") return e;
			if (typeof e == "function") return t(e(r, i, a, o), n)(r, i, a, o);
			var c = (n ? r : i).options.group.name;
			return e === !0 || typeof e == "string" && e === c || e.join && e.indexOf(c) > -1;
		};
	}
	var n = {}, r = e.group;
	r && kt(r) == "object" || (r = { name: r }), n.name = r.name, n.checkPull = t(r.pull, !0), n.checkPut = t(r.put), n.revertClone = r.revertClone, e.group = n;
}, Kn = function() {
	!Vn && W && F(W, "display", "none");
}, qn = function() {
	!Vn && W && F(W, "display", "");
};
Ln && !Lt && document.addEventListener("click", function(e) {
	if (xn) return e.preventDefault(), e.stopPropagation && e.stopPropagation(), e.stopImmediatePropagation && e.stopImmediatePropagation(), xn = !1, !1;
}, !0);
var Jn = function(e) {
	if (H) {
		e = e.touches ? e.touches[0] : e;
		var t = Wn(e.clientX, e.clientY);
		if (t) {
			var n = {};
			for (var r in e) e.hasOwnProperty(r) && (n[r] = e[r]);
			n.target = n.rootEl = t, n.preventDefault = void 0, n.stopPropagation = void 0, t[z]._onDragOver(n);
		}
	}
}, Yn = function(e) {
	H && H.parentNode[z]._isOutsideThisEl(e.target);
};
function Z(e, t) {
	if (!(e && e.nodeType && e.nodeType === 1)) throw `Sortable: \`el\` must be an HTMLElement, not ${{}.toString.call(e)}`;
	this.el = e, this.options = t = Ct({}, t), e[z] = this;
	var n = {
		group: null,
		sort: !0,
		disabled: !1,
		store: null,
		handle: null,
		draggable: /^[uo]l$/i.test(e.nodeName) ? ">li" : ">*",
		swapThreshold: 1,
		invertSwap: !1,
		invertedSwapThreshold: null,
		removeCloneOnHide: !0,
		direction: function() {
			return Hn(e, this.options);
		},
		ghostClass: "sortable-ghost",
		chosenClass: "sortable-chosen",
		dragClass: "sortable-drag",
		ignore: "a, img",
		filter: null,
		preventOnFilter: !0,
		animation: 0,
		easing: null,
		setData: function(e, t) {
			e.setData("Text", t.textContent);
		},
		dropBubble: !1,
		dragoverBubble: !1,
		dataIdAttr: "data-id",
		delay: 0,
		delayOnTouchOnly: !1,
		touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
		forceFallback: !1,
		fallbackClass: "sortable-fallback",
		fallbackOnBody: !1,
		fallbackTolerance: 0,
		fallbackOffset: {
			x: 0,
			y: 0
		},
		supportPointer: Z.supportPointer !== !1 && "PointerEvent" in window && (!Ft || It),
		emptyInsertThreshold: 5
	};
	for (var r in un.initializePlugins(this, e, n), n) !(r in t) && (t[r] = n[r]);
	for (var i in Gn(t), this) i.charAt(0) === "_" && typeof this[i] == "function" && (this[i] = this[i].bind(this));
	this.nativeDraggable = !t.forceFallback && Bn, this.nativeDraggable && (this.options.touchStartThreshold = 1), t.supportPointer ? j(e, "pointerdown", this._onTapStart) : (j(e, "mousedown", this._onTapStart), j(e, "touchstart", this._onTapStart)), this.nativeDraggable && (j(e, "dragover", this), j(e, "dragenter", this)), Sn.push(this.el), t.store && t.store.get && this.sort(t.store.get(this) || []), Ct(this, an());
}
Z.prototype = {
	constructor: Z,
	_isOutsideThisEl: function(e) {
		!this.el.contains(e) && e !== this.el && (kn = null);
	},
	_getDirection: function(e, t) {
		return typeof this.options.direction == "function" ? this.options.direction.call(this, e, t, H) : this.options.direction;
	},
	_onTapStart: function(e) {
		if (e.cancelable) {
			var t = this, n = this.el, r = this.options, i = r.preventOnFilter, a = e.type, o = e.touches && e.touches[0] || e.pointerType && e.pointerType === "touch" && e, s = (o || e).target, c = e.target.shadowRoot && (e.path && e.path[0] || e.composedPath && e.composedPath()[0]) || s, l = r.filter;
			if (ar(n), !H && !(/mousedown|pointerdown/.test(a) && e.button !== 0 || r.disabled) && !c.isContentEditable && !(!this.nativeDraggable && Ft && s && s.tagName.toUpperCase() === "SELECT") && (s = N(s, r.draggable, n, !1), !(s && s.animated) && mn !== s)) {
				if (gn = R(s), _n = R(s, r.draggable), typeof l == "function") {
					if (l.call(this, e, s, this)) {
						V({
							sortable: t,
							rootEl: c,
							name: "filter",
							targetEl: s,
							toEl: n,
							fromEl: n
						}), B("filter", t, { evt: e }), i && e.preventDefault();
						return;
					}
				} else if (l && (l = l.split(",").some(function(r) {
					if (r = N(c, r.trim(), n, !1), r) return V({
						sortable: t,
						rootEl: r,
						name: "filter",
						targetEl: s,
						fromEl: n,
						toEl: n
					}), B("filter", t, { evt: e }), !0;
				}), l)) {
					i && e.preventDefault();
					return;
				}
				(!r.handle || N(c, r.handle, n, !1)) && this._prepareDragStart(e, o, s);
			}
		}
	},
	_prepareDragStart: function(e, t, n) {
		var r = this, i = r.el, a = r.options, o = i.ownerDocument, s;
		if (n && !H && n.parentNode === i) {
			var c = L(n);
			if (G = i, H = n, U = H.parentNode, pn = H.nextSibling, mn = n, yn = a.group, Z.dragged = H, Cn = {
				target: H,
				clientX: (t || e).clientX,
				clientY: (t || e).clientY
			}, En = Cn.clientX - c.left, Dn = Cn.clientY - c.top, this._lastX = (t || e).clientX, this._lastY = (t || e).clientY, H.style["will-change"] = "all", s = function() {
				B("delayEnded", r, { evt: e }), Z.eventCanceled ? r._onDrop() : (r._disableDelayedDragEvents(), !Pt && r.nativeDraggable && (H.draggable = !0), r._triggerDragStart(e, t), V({
					sortable: r,
					name: "choose",
					originalEvent: e
				}), P(H, a.chosenClass, !0));
			}, a.ignore.split(",").forEach(function(e) {
				Ut(H, e.trim(), Qn);
			}), j(o, "dragover", Jn), j(o, "mousemove", Jn), j(o, "touchmove", Jn), a.supportPointer ? (j(o, "pointerup", r._onDrop), !this.nativeDraggable && j(o, "pointercancel", r._onDrop)) : (j(o, "mouseup", r._onDrop), j(o, "touchend", r._onDrop), j(o, "touchcancel", r._onDrop)), Pt && this.nativeDraggable && (this.options.touchStartThreshold = 4, H.draggable = !0), B("delayStart", this, { evt: e }), a.delay && (!a.delayOnTouchOnly || t) && (!this.nativeDraggable || !(Nt || Mt))) {
				if (Z.eventCanceled) {
					this._onDrop();
					return;
				}
				a.supportPointer ? (j(o, "pointerup", r._disableDelayedDrag), j(o, "pointercancel", r._disableDelayedDrag)) : (j(o, "mouseup", r._disableDelayedDrag), j(o, "touchend", r._disableDelayedDrag), j(o, "touchcancel", r._disableDelayedDrag)), j(o, "mousemove", r._delayedDragTouchMoveHandler), j(o, "touchmove", r._delayedDragTouchMoveHandler), a.supportPointer && j(o, "pointermove", r._delayedDragTouchMoveHandler), r._dragStartTimer = setTimeout(s, a.delay);
			} else s();
		}
	},
	_delayedDragTouchMoveHandler: function(e) {
		var t = e.touches ? e.touches[0] : e;
		Math.max(Math.abs(t.clientX - this._lastX), Math.abs(t.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1)) && this._disableDelayedDrag();
	},
	_disableDelayedDrag: function() {
		H && Qn(H), clearTimeout(this._dragStartTimer), this._disableDelayedDragEvents();
	},
	_disableDelayedDragEvents: function() {
		var e = this.el.ownerDocument;
		M(e, "mouseup", this._disableDelayedDrag), M(e, "touchend", this._disableDelayedDrag), M(e, "touchcancel", this._disableDelayedDrag), M(e, "pointerup", this._disableDelayedDrag), M(e, "pointercancel", this._disableDelayedDrag), M(e, "mousemove", this._delayedDragTouchMoveHandler), M(e, "touchmove", this._delayedDragTouchMoveHandler), M(e, "pointermove", this._delayedDragTouchMoveHandler);
	},
	_triggerDragStart: function(e, t) {
		t ||= e.pointerType == "touch" && e, !this.nativeDraggable || t ? this.options.supportPointer ? j(document, "pointermove", this._onTouchMove) : t ? j(document, "touchmove", this._onTouchMove) : j(document, "mousemove", this._onTouchMove) : (j(H, "dragend", this), j(G, "dragstart", this._onDragStart));
		try {
			document.selection ? or(function() {
				document.selection.empty();
			}) : window.getSelection().removeAllRanges();
		} catch {}
	},
	_dragStarted: function(e, t) {
		if (bn = !1, G && H) {
			B("dragStarted", this, { evt: t }), this.nativeDraggable && j(document, "dragover", Yn);
			var n = this.options;
			!e && P(H, n.dragClass, !1), P(H, n.ghostClass, !0), Z.active = this, e && this._appendGhost(), V({
				sortable: this,
				name: "start",
				originalEvent: t
			});
		} else this._nulling();
	},
	_emulateDragOver: function() {
		if (Y) {
			this._lastX = Y.clientX, this._lastY = Y.clientY, Kn();
			for (var e = document.elementFromPoint(Y.clientX, Y.clientY), t = e; e && e.shadowRoot && (e = e.shadowRoot.elementFromPoint(Y.clientX, Y.clientY), e !== t);) t = e;
			if (H.parentNode[z]._isOutsideThisEl(e), t) do {
				if (t[z]) {
					var n = void 0;
					if (n = t[z]._onDragOver({
						clientX: Y.clientX,
						clientY: Y.clientY,
						target: e,
						rootEl: t
					}), n && !this.options.dragoverBubble) break;
				}
				e = t;
			} while (t = Bt(t));
			qn();
		}
	},
	_onTouchMove: function(e) {
		if (Cn) {
			var t = this.options, n = t.fallbackTolerance, r = t.fallbackOffset, i = e.touches ? e.touches[0] : e, a = W && Ht(W, !0), o = W && a && a.a, s = W && a && a.d, c = Rn && X && qt(X), l = (i.clientX - Cn.clientX + r.x) / (o || 1) + (c ? c[0] - Pn[0] : 0) / (o || 1), u = (i.clientY - Cn.clientY + r.y) / (s || 1) + (c ? c[1] - Pn[1] : 0) / (s || 1);
			if (!Z.active && !bn) {
				if (n && Math.max(Math.abs(i.clientX - this._lastX), Math.abs(i.clientY - this._lastY)) < n) return;
				this._onDragStart(e, !0);
			}
			if (W) {
				a ? (a.e += l - (wn || 0), a.f += u - (Tn || 0)) : a = {
					a: 1,
					b: 0,
					c: 0,
					d: 1,
					e: l,
					f: u
				};
				var d = `matrix(${a.a},${a.b},${a.c},${a.d},${a.e},${a.f})`;
				F(W, "webkitTransform", d), F(W, "mozTransform", d), F(W, "msTransform", d), F(W, "transform", d), wn = l, Tn = u, Y = i;
			}
			e.cancelable && e.preventDefault();
		}
	},
	_appendGhost: function() {
		if (!W) {
			var e = this.options.fallbackOnBody ? document.body : G, t = L(H, !0, Rn, !0, e), n = this.options;
			if (Rn) {
				for (X = e; F(X, "position") === "static" && F(X, "transform") === "none" && X !== document;) X = X.parentNode;
				X !== document.body && X !== document.documentElement ? (X === document && (X = I()), t.top += X.scrollTop, t.left += X.scrollLeft) : X = I(), Pn = qt(X);
			}
			W = H.cloneNode(!0), P(W, n.ghostClass, !1), P(W, n.fallbackClass, !0), P(W, n.dragClass, !0), F(W, "transition", ""), F(W, "transform", ""), F(W, "box-sizing", "border-box"), F(W, "margin", 0), F(W, "top", t.top), F(W, "left", t.left), F(W, "width", t.width), F(W, "height", t.height), F(W, "opacity", "0.8"), F(W, "position", Rn ? "absolute" : "fixed"), F(W, "zIndex", "100000"), F(W, "pointerEvents", "none"), Z.ghost = W, e.appendChild(W), F(W, "transform-origin", En / parseInt(W.style.width) * 100 + "% " + Dn / parseInt(W.style.height) * 100 + "%");
		}
	},
	_onDragStart: function(e, t) {
		var n = this, r = e.dataTransfer, i = n.options;
		B("dragStart", this, { evt: e }), Z.eventCanceled ? this._onDrop() : (B("setupClone", this), Z.eventCanceled || (K = nn(H), K.removeAttribute("id"), K.draggable = !1, K.style["will-change"] = "", this._hideClone(), P(K, this.options.chosenClass, !1), Z.clone = K), n.cloneId = or(function() {
			B("clone", n), Z.eventCanceled || (n.options.removeCloneOnHide || G.insertBefore(K, H), n._hideClone(), V({
				sortable: n,
				name: "clone"
			}));
		}), !t && P(H, i.dragClass, !0), t ? (xn = !0, n._loopId = setInterval(n._emulateDragOver, 50)) : (M(document, "mouseup", n._onDrop), M(document, "touchend", n._onDrop), M(document, "touchcancel", n._onDrop), r && (r.effectAllowed = "move", i.setData && i.setData.call(n, r, H)), j(document, "drop", n), F(H, "transform", "translateZ(0)")), bn = !0, n._dragStartId = or(n._dragStarted.bind(n, t, e)), j(document, "selectstart", n), On = !0, window.getSelection().removeAllRanges(), Ft && F(document.body, "user-select", "none"));
	},
	_onDragOver: function(e) {
		var t = this.el, n = e.target, r, i, a, o = this.options, s = o.group, c = Z.active, l = yn === s, u = o.sort, d = J || c, f, p = this, m = !1;
		if (Fn) return;
		function h(o, s) {
			B(o, p, A({
				evt: e,
				isOwner: l,
				axis: f ? "vertical" : "horizontal",
				revert: a,
				dragRect: r,
				targetRect: i,
				canSort: u,
				fromSortable: d,
				target: n,
				completed: g,
				onMove: function(n, i) {
					return Zn(G, t, H, r, n, L(n), e, i);
				},
				changed: te
			}, s));
		}
		function ee() {
			h("dragOverAnimationCapture"), p.captureAnimationState(), p !== d && d.captureAnimationState();
		}
		function g(r) {
			return h("dragOverCompleted", { insertion: r }), r && (l ? c._hideClone() : c._showClone(p), p !== d && (P(H, J ? J.options.ghostClass : c.options.ghostClass, !1), P(H, o.ghostClass, !0)), J !== p && p !== Z.active ? J = p : p === Z.active && J && (J = null), d === p && (p._ignoreWhileAnimating = n), p.animateAll(function() {
				h("dragOverAnimationComplete"), p._ignoreWhileAnimating = null;
			}), p !== d && (d.animateAll(), d._ignoreWhileAnimating = null)), (n === H && !H.animated || n === t && !n.animated) && (kn = null), !o.dragoverBubble && !e.rootEl && n !== document && (H.parentNode[z]._isOutsideThisEl(e.target), !r && Jn(e)), !o.dragoverBubble && e.stopPropagation && e.stopPropagation(), m = !0;
		}
		function te() {
			q = R(H), vn = R(H, o.draggable), V({
				sortable: p,
				name: "change",
				toEl: t,
				newIndex: q,
				newDraggableIndex: vn,
				originalEvent: e
			});
		}
		if (e.preventDefault !== void 0 && e.cancelable && e.preventDefault(), n = N(n, o.draggable, t, !0), h("dragOver"), Z.eventCanceled) return m;
		if (H.contains(e.target) || n.animated && n.animatingX && n.animatingY || p._ignoreWhileAnimating === n) return g(!1);
		if (xn = !1, c && !o.disabled && (l ? u || (a = U !== G) : J === this || (this.lastPutMode = yn.checkPull(this, c, H, e)) && s.checkPut(this, c, H, e))) {
			if (f = this._getDirection(e, n) === "vertical", r = L(H), h("dragOverValid"), Z.eventCanceled) return m;
			if (a) return U = G, ee(), this._hideClone(), h("revert"), Z.eventCanceled || (pn ? G.insertBefore(H, pn) : G.appendChild(H)), g(!0);
			var _ = Kt(t, o.draggable);
			if (!_ || tr(e, f, this) && !_.animated) {
				if (_ === H) return g(!1);
				if (_ && t === e.target && (n = _), n && (i = L(n)), Zn(G, t, H, r, n, i, e, !!n) !== !1) return ee(), _ && _.nextSibling ? t.insertBefore(H, _.nextSibling) : t.appendChild(H), U = t, te(), g(!0);
			} else if (_ && er(e, f, this)) {
				var ne = Gt(t, 0, o, !0);
				if (ne === H) return g(!1);
				if (n = ne, i = L(n), Zn(G, t, H, r, n, i, e, !1) !== !1) return ee(), t.insertBefore(H, ne), U = t, te(), g(!0);
			} else if (n.parentNode === t) {
				i = L(n);
				var v = 0, re, y = H.parentNode !== t, ie = !Un(H.animated && H.toRect || r, n.animated && n.toRect || i, f), b = f ? "top" : "left", x = Wt(n, "top", "top") || Wt(H, "top", "top"), ae = x ? x.scrollTop : void 0;
				kn !== n && (re = i[b], jn = !1, Mn = !ie && o.invertSwap || y), v = nr(e, n, i, f, ie ? 1 : o.swapThreshold, o.invertedSwapThreshold == null ? o.swapThreshold : o.invertedSwapThreshold, Mn, kn === n);
				var S;
				if (v !== 0) {
					var C = R(H);
					do
						C -= v, S = U.children[C];
					while (S && (F(S, "display") === "none" || S === W));
				}
				if (v === 0 || S === n) return g(!1);
				kn = n, An = v;
				var oe = n.nextElementSibling, se = !1;
				se = v === 1;
				var w = Zn(G, t, H, r, n, i, e, se);
				if (w !== !1) return (w === 1 || w === -1) && (se = w === 1), Fn = !0, setTimeout($n, 30), ee(), se && !oe ? t.appendChild(H) : n.parentNode.insertBefore(H, se ? oe : n), x && tn(x, 0, ae - x.scrollTop), U = H.parentNode, re !== void 0 && !Mn && (Nn = Math.abs(re - L(n)[b])), te(), g(!0);
			}
			if (t.contains(H)) return g(!1);
		}
		return !1;
	},
	_ignoreWhileAnimating: null,
	_offMoveEvents: function() {
		M(document, "mousemove", this._onTouchMove), M(document, "touchmove", this._onTouchMove), M(document, "pointermove", this._onTouchMove), M(document, "dragover", Jn), M(document, "mousemove", Jn), M(document, "touchmove", Jn);
	},
	_offUpEvents: function() {
		var e = this.el.ownerDocument;
		M(e, "mouseup", this._onDrop), M(e, "touchend", this._onDrop), M(e, "pointerup", this._onDrop), M(e, "pointercancel", this._onDrop), M(e, "touchcancel", this._onDrop), M(document, "selectstart", this);
	},
	_onDrop: function(e) {
		var t = this.el, n = this.options;
		q = R(H), vn = R(H, n.draggable), B("drop", this, { evt: e }), U = H && H.parentNode, q = R(H), vn = R(H, n.draggable), Z.eventCanceled || (bn = !1, Mn = !1, jn = !1, clearInterval(this._loopId), clearTimeout(this._dragStartTimer), sr(this.cloneId), sr(this._dragStartId), this.nativeDraggable && (M(document, "drop", this), M(t, "dragstart", this._onDragStart)), this._offMoveEvents(), this._offUpEvents(), Ft && F(document.body, "user-select", ""), F(H, "transform", ""), e && (On && (e.cancelable && e.preventDefault(), !n.dropBubble && e.stopPropagation()), W && W.parentNode && W.parentNode.removeChild(W), (G === U || J && J.lastPutMode !== "clone") && K && K.parentNode && K.parentNode.removeChild(K), H && (this.nativeDraggable && M(H, "dragend", this), Qn(H), H.style["will-change"] = "", On && !bn && P(H, J ? J.options.ghostClass : this.options.ghostClass, !1), P(H, this.options.chosenClass, !1), V({
			sortable: this,
			name: "unchoose",
			toEl: U,
			newIndex: null,
			newDraggableIndex: null,
			originalEvent: e
		}), G === U ? q !== gn && q >= 0 && (V({
			sortable: this,
			name: "update",
			toEl: U,
			originalEvent: e
		}), V({
			sortable: this,
			name: "sort",
			toEl: U,
			originalEvent: e
		})) : (q >= 0 && (V({
			rootEl: U,
			name: "add",
			toEl: U,
			fromEl: G,
			originalEvent: e
		}), V({
			sortable: this,
			name: "remove",
			toEl: U,
			originalEvent: e
		}), V({
			rootEl: U,
			name: "sort",
			toEl: U,
			fromEl: G,
			originalEvent: e
		}), V({
			sortable: this,
			name: "sort",
			toEl: U,
			originalEvent: e
		})), J && J.save()), Z.active && ((q == null || q === -1) && (q = gn, vn = _n), V({
			sortable: this,
			name: "end",
			toEl: U,
			originalEvent: e
		}), this.save())))), this._nulling();
	},
	_nulling: function() {
		B("nulling", this), G = H = U = W = pn = K = mn = hn = Cn = Y = On = q = vn = gn = _n = kn = An = J = yn = Z.dragged = Z.ghost = Z.clone = Z.active = null;
		var e = this.el;
		In.forEach(function(t) {
			e.contains(t) && (t.checked = !0);
		}), In.length = wn = Tn = 0;
	},
	handleEvent: function(e) {
		switch (e.type) {
			case "drop":
			case "dragend":
				this._onDrop(e);
				break;
			case "dragenter":
			case "dragover":
				H && (this._onDragOver(e), Xn(e));
				break;
			case "selectstart": e.preventDefault();
		}
	},
	toArray: function() {
		for (var e = [], t, n = this.el.children, r = 0, i = n.length, a = this.options; r < i; r++) t = n[r], N(t, a.draggable, this.el, !1) && e.push(t.getAttribute(a.dataIdAttr) || ir(t));
		return e;
	},
	sort: function(e, t) {
		var n = {}, r = this.el;
		this.toArray().forEach(function(e, t) {
			var i = r.children[t];
			N(i, this.options.draggable, r, !1) && (n[e] = i);
		}, this), t && this.captureAnimationState(), e.forEach(function(e) {
			n[e] && (r.removeChild(n[e]), r.appendChild(n[e]));
		}), t && this.animateAll();
	},
	save: function() {
		var e = this.options.store;
		e && e.set && e.set(this);
	},
	closest: function(e, t) {
		return N(e, t || this.options.draggable, this.el, !1);
	},
	option: function(e, t) {
		var n = this.options;
		if (t === void 0) return n[e];
		var r = un.modifyOption(this, e, t);
		n[e] = r === void 0 ? t : r, e === "group" && Gn(n);
	},
	destroy: function() {
		B("destroy", this);
		var e = this.el;
		e[z] = null, M(e, "mousedown", this._onTapStart), M(e, "touchstart", this._onTapStart), M(e, "pointerdown", this._onTapStart), this.nativeDraggable && (M(e, "dragover", this), M(e, "dragenter", this)), Array.prototype.forEach.call(e.querySelectorAll("[draggable]"), function(e) {
			e.removeAttribute("draggable");
		}), this._onDrop(), this._disableDelayedDragEvents(), Sn.splice(Sn.indexOf(this.el), 1), this.el = e = null;
	},
	_hideClone: function() {
		if (!hn) {
			if (B("hideClone", this), Z.eventCanceled) return;
			F(K, "display", "none"), this.options.removeCloneOnHide && K.parentNode && K.parentNode.removeChild(K), hn = !0;
		}
	},
	_showClone: function(e) {
		if (e.lastPutMode !== "clone") this._hideClone();
		else if (hn) {
			if (B("showClone", this), Z.eventCanceled) return;
			H.parentNode == G && !this.options.group.revertClone ? G.insertBefore(K, H) : pn ? G.insertBefore(K, pn) : G.appendChild(K), this.options.group.revertClone && this.animate(H, K), F(K, "display", ""), hn = !1;
		}
	}
};
function Xn(e) {
	e.dataTransfer && (e.dataTransfer.dropEffect = "move"), e.cancelable && e.preventDefault();
}
function Zn(e, t, n, r, i, a, o, s) {
	var c, l = e[z], u = l.options.onMove, d;
	return window.CustomEvent && !Mt && !Nt ? c = new CustomEvent("move", {
		bubbles: !0,
		cancelable: !0
	}) : (c = document.createEvent("Event"), c.initEvent("move", !0, !0)), c.to = t, c.from = e, c.dragged = n, c.draggedRect = r, c.related = i || t, c.relatedRect = a || L(t), c.willInsertAfter = s, c.originalEvent = o, e.dispatchEvent(c), u && (d = u.call(l, c, o)), d;
}
function Qn(e) {
	e.draggable = !1;
}
function $n() {
	Fn = !1;
}
function er(e, t, n) {
	var r = L(Gt(n.el, 0, n.options, !0)), i = rn(n.el, n.options, W), a = 10;
	return t ? e.clientX < i.left - a || e.clientY < r.top && e.clientX < r.right : e.clientY < i.top - a || e.clientY < r.bottom && e.clientX < r.left;
}
function tr(e, t, n) {
	var r = L(Kt(n.el, n.options.draggable)), i = rn(n.el, n.options, W), a = 10;
	return t ? e.clientX > i.right + a || e.clientY > r.bottom && e.clientX > r.left : e.clientY > i.bottom + a || e.clientX > r.right && e.clientY > r.top;
}
function nr(e, t, n, r, i, a, o, s) {
	var c = r ? e.clientY : e.clientX, l = r ? n.height : n.width, u = r ? n.top : n.left, d = r ? n.bottom : n.right, f = !1;
	if (!o) {
		if (s && Nn < l * i) {
			if (!jn && (An === 1 ? c > u + l * a / 2 : c < d - l * a / 2) && (jn = !0), jn) f = !0;
			else if (An === 1 ? c < u + Nn : c > d - Nn) return -An;
		} else if (c > u + l * (1 - i) / 2 && c < d - l * (1 - i) / 2) return rr(t);
	}
	return f ||= o, f && (c < u + l * a / 2 || c > d - l * a / 2) ? c > u + l / 2 ? 1 : -1 : 0;
}
function rr(e) {
	return R(H) < R(e) ? 1 : -1;
}
function ir(e) {
	for (var t = e.tagName + e.className + e.src + e.href + e.textContent, n = t.length, r = 0; n--;) r += t.charCodeAt(n);
	return r.toString(36);
}
function ar(e) {
	In.length = 0;
	for (var t = e.getElementsByTagName("input"), n = t.length; n--;) {
		var r = t[n];
		r.checked && In.push(r);
	}
}
function or(e) {
	return setTimeout(e, 0);
}
function sr(e) {
	return clearTimeout(e);
}
Ln && j(document, "touchmove", function(e) {
	(Z.active || bn) && e.cancelable && e.preventDefault();
}), Z.utils = {
	on: j,
	off: M,
	css: F,
	find: Ut,
	is: function(e, t) {
		return !!N(e, t, e, !1);
	},
	extend: Xt,
	throttle: $t,
	closest: N,
	toggleClass: P,
	clone: nn,
	index: R,
	nextTick: or,
	cancelNextTick: sr,
	detectDirection: Hn,
	getChild: Gt,
	expando: z
}, Z.get = function(e) {
	return e[z];
}, Z.mount = function() {
	var e = [...arguments];
	e[0].constructor === Array && (e = e[0]), e.forEach(function(e) {
		if (!e.prototype || !e.prototype.constructor) throw `Sortable: Mounted plugin must be a constructor function, not ${{}.toString.call(e)}`;
		e.utils && (Z.utils = A(A({}, Z.utils), e.utils)), un.mount(e);
	});
}, Z.create = function(e, t) {
	return new Z(e, t);
}, Z.version = At;
var Q = [], cr, lr, ur = !1, dr, fr, pr, mr;
function hr() {
	function e() {
		for (var e in this.defaults = {
			scroll: !0,
			forceAutoScrollFallback: !1,
			scrollSensitivity: 30,
			scrollSpeed: 10,
			bubbleScroll: !0
		}, this) e.charAt(0) === "_" && typeof this[e] == "function" && (this[e] = this[e].bind(this));
	}
	return e.prototype = {
		dragStarted: function(e) {
			var t = e.originalEvent;
			this.sortable.nativeDraggable ? j(document, "dragover", this._handleAutoScroll) : this.options.supportPointer ? j(document, "pointermove", this._handleFallbackAutoScroll) : t.touches ? j(document, "touchmove", this._handleFallbackAutoScroll) : j(document, "mousemove", this._handleFallbackAutoScroll);
		},
		dragOverCompleted: function(e) {
			var t = e.originalEvent;
			!this.options.dragOverBubble && !t.rootEl && this._handleAutoScroll(t);
		},
		drop: function() {
			this.sortable.nativeDraggable ? M(document, "dragover", this._handleAutoScroll) : (M(document, "pointermove", this._handleFallbackAutoScroll), M(document, "touchmove", this._handleFallbackAutoScroll), M(document, "mousemove", this._handleFallbackAutoScroll)), _r(), gr(), en();
		},
		nulling: function() {
			pr = lr = cr = ur = mr = dr = fr = null, Q.length = 0;
		},
		_handleFallbackAutoScroll: function(e) {
			this._handleAutoScroll(e, !0);
		},
		_handleAutoScroll: function(e, t) {
			var n = this, r = (e.touches ? e.touches[0] : e).clientX, i = (e.touches ? e.touches[0] : e).clientY, a = document.elementFromPoint(r, i);
			if (pr = e, t || this.options.forceAutoScrollFallback || Nt || Mt || Ft) {
				vr(e, this.options, a, t);
				var o = Yt(a, !0);
				ur && (!mr || r !== dr || i !== fr) && (mr && _r(), mr = setInterval(function() {
					var a = Yt(document.elementFromPoint(r, i), !0);
					a !== o && (o = a, gr()), vr(e, n.options, a, t);
				}, 10), dr = r, fr = i);
			} else {
				if (!this.options.bubbleScroll || Yt(a, !0) === I()) {
					gr();
					return;
				}
				vr(e, this.options, Yt(a, !1), !1);
			}
		}
	}, Ct(e, {
		pluginName: "scroll",
		initializeByDefault: !0
	});
}
function gr() {
	Q.forEach(function(e) {
		clearInterval(e.pid);
	}), Q = [];
}
function _r() {
	clearInterval(mr);
}
var vr = $t(function(e, t, n, r) {
	if (t.scroll) {
		var i = (e.touches ? e.touches[0] : e).clientX, a = (e.touches ? e.touches[0] : e).clientY, o = t.scrollSensitivity, s = t.scrollSpeed, c = I(), l = !1, u;
		lr !== n && (lr = n, gr(), cr = t.scroll, u = t.scrollFn, cr === !0 && (cr = Yt(n, !0)));
		var d = 0, f = cr;
		do {
			var p = f, m = L(p), h = m.top, ee = m.bottom, g = m.left, te = m.right, _ = m.width, ne = m.height, v = void 0, re = void 0, y = p.scrollWidth, ie = p.scrollHeight, b = F(p), x = p.scrollLeft, ae = p.scrollTop;
			p === c ? (v = _ < y && (b.overflowX === "auto" || b.overflowX === "scroll" || b.overflowX === "visible"), re = ne < ie && (b.overflowY === "auto" || b.overflowY === "scroll" || b.overflowY === "visible")) : (v = _ < y && (b.overflowX === "auto" || b.overflowX === "scroll"), re = ne < ie && (b.overflowY === "auto" || b.overflowY === "scroll"));
			var S = v && (Math.abs(te - i) <= o && x + _ < y) - (Math.abs(g - i) <= o && !!x), C = re && (Math.abs(ee - a) <= o && ae + ne < ie) - (Math.abs(h - a) <= o && !!ae);
			if (!Q[d]) for (var oe = 0; oe <= d; oe++) Q[oe] || (Q[oe] = {});
			(Q[d].vx != S || Q[d].vy != C || Q[d].el !== p) && (Q[d].el = p, Q[d].vx = S, Q[d].vy = C, clearInterval(Q[d].pid), (S != 0 || C != 0) && (l = !0, Q[d].pid = setInterval(function() {
				r && this.layer === 0 && Z.active._onTouchMove(pr);
				var t = Q[this.layer].vy ? Q[this.layer].vy * s : 0, n = Q[this.layer].vx ? Q[this.layer].vx * s : 0;
				(typeof u != "function" || u.call(Z.dragged.parentNode[z], n, t, e, pr, Q[this.layer].el) === "continue") && tn(Q[this.layer].el, n, t);
			}.bind({ layer: d }), 24))), d++;
		} while (t.bubbleScroll && f !== c && (f = Yt(f, !1)));
		ur = l;
	}
}, 30), yr = function(e) {
	var t = e.originalEvent, n = e.putSortable, r = e.dragEl, i = e.activeSortable, a = e.dispatchSortableEvent, o = e.hideGhostForTarget, s = e.unhideGhostForTarget;
	if (t) {
		var c = n || i;
		o();
		var l = t.changedTouches && t.changedTouches.length ? t.changedTouches[0] : t, u = document.elementFromPoint(l.clientX, l.clientY);
		s(), c && !c.el.contains(u) && (a("spill"), this.onSpill({
			dragEl: r,
			putSortable: n
		}));
	}
};
function br() {}
br.prototype = {
	startIndex: null,
	dragStart: function(e) {
		var t = e.oldDraggableIndex;
		this.startIndex = t;
	},
	onSpill: function(e) {
		var t = e.dragEl, n = e.putSortable;
		this.sortable.captureAnimationState(), n && n.captureAnimationState();
		var r = Gt(this.sortable.el, this.startIndex, this.options);
		r ? this.sortable.el.insertBefore(t, r) : this.sortable.el.appendChild(t), this.sortable.animateAll(), n && n.animateAll();
	},
	drop: yr
}, Ct(br, { pluginName: "revertOnSpill" });
function xr() {}
xr.prototype = {
	onSpill: function(e) {
		var t = e.dragEl, n = e.putSortable || this.sortable;
		n.captureAnimationState(), t.parentNode && t.parentNode.removeChild(t), n.animateAll();
	},
	drop: yr
}, Ct(xr, { pluginName: "removeOnSpill" }), Z.mount(new hr()), Z.mount(xr, br);
// src/catalog.js
function $(e, t) {
	let n = e.localized;
	return (n[t] || n.en || Object.values(n)[0])?.name || e.id;
}
function Sr(e, t, n) {
	return n && n !== t ? n : e.find((e) => e !== t);
}
function Cr(e, t) {
	return (n) => ({
		name: $(n, e),
		hint: n.localized[t]?.name ?? ""
	});
}
var wr = {
	mass: "g",
	volume: "ml"
}, Tr = /* @__PURE__ */ new Set([
	"ja",
	"zh",
	"ko",
	"th",
	"vi",
	"id",
	"ms",
	"km",
	"lo",
	"my"
]), Er = (e) => !Tr.has(e.split("-")[0]), Dr = 1600;
async function Or(e) {
	let t = await createImageBitmap(e, { imageOrientation: "from-image" }), n = Math.min(1, Dr / Math.max(t.width, t.height)), r = document.createElement("canvas");
	r.width = Math.round(t.width * n), r.height = Math.round(t.height * n);
	let i = r.getContext("2d");
	i.fillStyle = "#fff", i.fillRect(0, 0, r.width, r.height), i.drawImage(t, 0, 0, r.width, r.height), t.close();
	let a = r.toDataURL("image/jpeg", .85);
	return a.slice(a.indexOf(",") + 1);
}
// src/search.js
function kr(e) {
	return Object.values(e.localized).flatMap((e) => [
		e.name,
		e.plural,
		...e.aliases || []
	].filter(Boolean));
}
function Ar(e, t, n = 8) {
	let r = t.trim().toLowerCase();
	if (!r) return e.slice(0, n);
	let i = [];
	for (let t of e) {
		let e = kr(t).map((e) => e.toLowerCase()), n = e.some((e) => e === r) ? 0 : e.some((e) => e.startsWith(r)) ? 1 : e.some((e) => e.includes(r)) ? 2 : -1;
		n >= 0 && i.push([n, t]);
	}
	return i.sort((e, t) => e[0] - t[0]).slice(0, n).map(([, e]) => e);
}
function jr(e, t) {
	let n = t.trim().toLowerCase();
	return e.find((e) => kr(e).some((e) => e.toLowerCase() === n));
}
function Mr(e, t) {
	let n = e.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "ingredient", r = n;
	for (let e = 2; t.has(r); e++) r = `${n}_${e}`;
	return r;
}
// src/views/combo.js
var Nr = class extends D {
	static properties = {
		entries: { attribute: !1 },
		value: {},
		label: { attribute: !1 },
		hint: { attribute: !1 },
		placeholder: {},
		createLabel: {},
		noCreate: { type: Boolean },
		invalid: {
			type: Boolean,
			reflect: !0
		},
		_query: { state: !0 },
		_open: { state: !0 },
		_active: { state: !0 }
	};
	static styles = [O, o`
      :host { display: block; position: relative; min-width: 0; }
      :host([invalid]) input { border-color: var(--it-error); }
      ul {
        position: absolute; z-index: 5; left: 0; right: 0; top: calc(100% + 4px); margin: 0; padding: 6px;
        list-style: none; background: var(--it-surface); border-radius: 14px;
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18); max-height: 280px; overflow: auto;
      }
      li { padding: 8px 10px; border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; gap: 12px; }
      li.active { background: var(--it-soft); }
      li .hint { color: var(--it-muted); font-size: 0.85rem; }
      li.create { color: var(--it-accent); font-weight: 600; }
    `];
	willUpdate(e) {
		e.has("value") && !this._open && (this._query = void 0);
	}
	_results() {
		let e = this._query !== void 0, t = e ? this._query : this.label ?? "";
		return {
			matches: t.trim() ? Ar(this.entries, t) : [],
			create: !this.noCreate && e && t.trim() && !jr(this.entries, t)
		};
	}
	_choose(e) {
		let { matches: t, create: n } = this._results();
		e < t.length ? this.dispatchEvent(new CustomEvent("pick", { detail: { id: t[e].id } })) : n && this.dispatchEvent(new CustomEvent("create", { detail: { name: this._query.trim() } })), this._open = !1, this._query = void 0, this.renderRoot.querySelector("input").blur();
	}
	_key(e) {
		let { matches: t, create: n } = this._results(), r = t.length + +!!n;
		if (e.key === "ArrowDown") this._active = Math.min((this._active ?? -1) + 1, r - 1);
		else if (e.key === "ArrowUp") this._active = Math.max((this._active ?? 0) - 1, 0);
		else if (e.key === "Enter" && r) this._choose(this._active ?? 0);
		else if (e.key === "Escape") this._open = !1, this._query = void 0;
		else return;
		e.preventDefault();
	}
	render() {
		let { matches: e, create: t } = this._open ? this._results() : {
			matches: [],
			create: !1
		};
		return T`
      <input type="text" placeholder=${this.placeholder ?? ""}
        .value=${this._query ?? this.label ?? ""}
        @focus=${(e) => {
			e.target.select(), this._open = !!this.label, this._active = void 0;
		}}
        @blur=${() => {
			this._open = !1, this._query = void 0;
		}}
        @input=${(e) => {
			this._query = e.target.value, this._open = !!this._query.trim(), this._active = 0;
		}}
        @keydown=${this._key} />
      ${this._open && (e.length || t) ? T`<ul @mousedown=${(e) => e.preventDefault()}>
            ${e.map((e, t) => T`<li class=${t === this._active ? "active" : ""} @click=${() => this._choose(t)}>
                <span>${this.hint(e).name}</span><span class="hint">${this.hint(e).hint}</span>
              </li>`)}
            ${t ? T`<li class="create ${this._active === e.length ? "active" : ""}" @click=${() => this._choose(e.length)}>
                  + ${this.createLabel} “${this._query.trim()}”</li>` : E}
          </ul>` : E}
    `;
	}
};
customElements.define("itadaki-combo", Nr);
// src/sections.js
function Pr(e) {
	let t = [];
	return e.forEach((e, n) => {
		let r = e.section || null, i = t[t.length - 1];
		i && i.section === r ? i.end = n : t.push({
			section: r,
			start: n,
			end: n
		});
	}), t;
}
function Fr(e, t, n) {
	let r = n.trim() || null;
	return e.map((e, n) => n >= t.start && n <= t.end ? {
		...e,
		section: r
	} : e);
}
function Ir(e, t, n) {
	let r = Pr(e), i = r.find((e) => t >= e.start && t <= e.end), a = n < 0 ? t === i.start : t === i.end, o = r[r.indexOf(i) + n];
	if (a) return o ? e.map((e, n) => n === t ? {
		...e,
		section: o.section
	} : e) : e;
	let s = [...e];
	return [s[t], s[t + n]] = [s[t + n], s[t]], s;
}
function Lr(e, t, n) {
	let r = [...e];
	return r.splice(t.end + 1, 0, {
		...n,
		section: t.section
	}), r;
}
function Rr(e, t, n, r, i) {
	let a = Pr(e).map((t) => ({
		section: t.section,
		items: e.slice(t.start, t.end + 1)
	})), [o] = a[t].items.splice(n, 1);
	return a[r].items.splice(i, 0, o), a.flatMap((e) => e.items.map((t) => ({
		...t,
		section: e.section
	})));
}
function zr(e, t) {
	let n = e[t].text.trim().replace(/[:：]$/, ""), r = e.filter((e, n) => n !== t), i = Pr(r).find((e) => t >= e.start && t <= e.end);
	return i ? r.map((e, r) => r >= t && r <= i.end ? {
		...e,
		section: n
	} : e) : r;
}
function Br(e, t) {
	let n = Pr(e).find((e) => e.end === t.start - 1), r = n ? n.section : null, i = {
		text: t.section,
		section: r
	}, a = e.map((e, n) => n >= t.start && n <= t.end ? {
		...e,
		section: r
	} : e);
	return a.splice(t.start, 0, i), a;
}
// src/views/editor.js
var Vr = (e) => e == null ? e : Math.round(e * 100) / 100, Hr = (e) => e === "" || e == null ? null : Vr(Number(e)), Ur = 0, Wr = (e) => ({
	...e,
	_key: ++Ur
}), Gr = ({ _key: e, _raw: t, ...n }) => n, Kr = (e) => e && e.trim() ? e.trim() : null, qr = class extends D {
	static properties = {
		api: { attribute: !1 },
		recipe: { attribute: !1 },
		ingredients: { attribute: !1 },
		units: { attribute: !1 },
		t: { attribute: !1 },
		uiLang: {},
		languages: { attribute: !1 },
		newIngredients: { attribute: !1 },
		fixedLanguage: { type: Boolean },
		_r: { state: !0 },
		_new: { state: !0 },
		_uploading: { state: !0 },
		_imageError: { state: !0 }
	};
	static styles = [O, o`
      :host { display: grid; gap: 16px; }
      .grid2 { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
      .line { display: grid; gap: 8px; align-items: center; margin-bottom: 10px;
        grid-template-columns: minmax(160px, 2fr) 80px minmax(90px, 1fr) minmax(120px, 2fr) auto; }
      .line.head { color: var(--it-muted); font-size: 0.75rem; margin-bottom: 4px; }
      .raw { grid-column: 1 / -1; font-size: 0.85rem; }
      @media (max-width: 800px) {
        .line { grid-template-columns: 1fr 1fr; padding-bottom: 10px; border-bottom: 1px solid var(--it-divider); }
        .line.head { display: none; }
      }
      .step { display: grid; gap: 8px; grid-template-columns: 1fr auto; margin-bottom: 10px; align-items: start; }
      .block { border-left: 3px solid var(--it-soft); padding-left: 12px; margin: 12px 0 16px; }
      .block.named { border-left-color: var(--it-accent); }
      .block-title { font-weight: 600; margin-bottom: 8px; }
      .tools { display: flex; gap: 2px; align-items: center; }
      .block .row { flex-wrap: nowrap; }
      .block-title { flex: 1; }
      .item { display: grid; grid-template-columns: 20px 1fr; gap: 6px; align-items: start; }
      .item > :last-child { min-width: 0; }
      .handle { cursor: grab; color: var(--it-muted); user-select: none; padding-top: 10px; text-align: center; touch-action: none; }
      .sortable-ghost { opacity: 0.4; }
      .items { min-height: 8px; }
      .names { display: grid; gap: 8px; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); margin-top: 8px; }
      .names.head label { margin: 12px 0 0; }
      itadaki-combo[invalid] { --it-invalid: 1; }
      input, select, textarea { padding: 10px; }
      .x { background: none; border: none; color: var(--it-muted); cursor: pointer; font-size: 1.1rem; padding: 6px; border-radius: 8px; }
      .x:hover { background: var(--it-soft); color: var(--it-text); }
      .x.del:hover { color: var(--it-error); }
      .about { container-type: inline-size; }
      .split { display: grid; gap: 0 24px; grid-template-columns: 1fr; }
      @container (min-width: 720px) { .split { grid-template-columns: 1fr 300px; } }
      .photo { width: 100%; max-height: 260px; object-fit: cover; border-radius: 14px; display: block; margin-bottom: 8px; }
      .photo-link { margin-top: 8px; }
    `];
	willUpdate(e) {
		if ((e.has("newIngredients") || !this._new) && (this._new = structuredClone(this.newIngredients || [])), e.has("recipe")) {
			let e = structuredClone(this.recipe);
			this._r = {
				...e,
				ingredients: e.ingredients.map(Wr),
				steps: e.steps.map(Wr)
			};
		}
	}
	get value() {
		return {
			...this._r,
			ingredients: this._r.ingredients.map(Gr),
			steps: this._r.steps.map(Gr)
		};
	}
	get newIngredientsUsed() {
		let e = new Set(this._r.ingredients.map((e) => e.ingredient_id));
		return this._new.filter((t) => e.has(t.id));
	}
	_create(e, t) {
		let n = {
			id: Mr(t, new Set([...this.ingredients, ...this._new].map((e) => e.id))),
			localized: { [this._r.language]: {
				name: t,
				plural: null,
				aliases: []
			} },
			density: null
		};
		this._new = [...this._new, n], this._setItem("ingredients", e, "ingredient_id", n.id);
	}
	_rename(e, t, n) {
		this._new = this._new.map((r) => {
			if (r.id !== e) return r;
			let i = { ...r.localized };
			return n.trim() ? i[t] = {
				...i[t] || {
					plural: null,
					aliases: []
				},
				name: n.trim()
			} : delete i[t], {
				...r,
				localized: i
			};
		});
	}
	updated() {
		this._sortables ??= /* @__PURE__ */ new WeakMap();
		for (let e of this.renderRoot.querySelectorAll(".items")) {
			if (this._sortables.has(e)) continue;
			let t;
			this._sortables.set(e, Z.create(e, {
				group: e.dataset.list,
				handle: ".handle",
				draggable: ".item",
				animation: 150,
				onStart: (e) => t = e.item.nextSibling,
				onEnd: (e) => {
					e.from.insertBefore(e.item, t);
					let n = e.from.dataset.list, r = Number(e.from.dataset.block), i = Number(e.to.dataset.block);
					(r !== i || e.oldIndex !== e.newIndex) && this._set(n, Rr(this._r[n], r, e.oldIndex, i, e.newIndex));
				}
			}));
		}
	}
	async _upload(e) {
		let t = e.target.files[0];
		if (e.target.value = "", t) {
			this._uploading = !0, this._imageError = void 0;
			try {
				let { image_url: e } = await this.api.call("upload_image", { data: await Or(t) });
				this._set("image_url", e);
			} catch (e) {
				this._imageError = e.message;
			} finally {
				this._uploading = !1;
			}
		}
	}
	_photo() {
		let e = this.t, t = this._r.image_url, n = t && !t.startsWith("/api/itadaki/images/") ? t : "";
		return T`
      <label>${e("photo")}</label>
      ${t ? T`<img class="photo" src=${t} alt="" referrerpolicy="no-referrer" />` : E}
      <input id="file" type="file" accept="image/*" hidden @change=${this._upload} />
      <div class="row">
        <button class="btn quiet" ?disabled=${this._uploading} @click=${() => this.renderRoot.querySelector("#file").click()}>
          ${e(t ? "changePhoto" : "addPhoto")}</button>
        ${t ? T`<button class="btn danger" ?disabled=${this._uploading} @click=${() => this._set("image_url", null)}>${e("removePhoto")}</button>` : E}
      </div>
      <itadaki-text class="photo-link" type="url" .value=${n} placeholder=${e("photoLink")}
        @change=${(e) => (e.target.value.trim() || n) && this._set("image_url", e.target.value.trim() || null)}></itadaki-text>
      ${this._uploading ? T`<itadaki-busy></itadaki-busy>` : E}
      ${this._imageError ? T`<div class="error">${this._imageError}</div>` : E}
    `;
	}
	_languagePicker() {
		let e = this._r;
		return T`<label>${this.t("language")}</label>
      <select @change=${(e) => this._set("language", e.target.value)}>
        ${[.../* @__PURE__ */ new Set([e.language, ...this.languages])].map((t) => T`<option value=${t} ?selected=${t === e.language}>${this.t.langName(t)}</option>`)}
      </select>`;
	}
	_set(e, t) {
		this._r = {
			...this._r,
			[e]: t
		};
	}
	_setItem(e, t, n, r) {
		let i = this._r[e].map((e, i) => i === t ? {
			...e,
			[n]: r
		} : e);
		this._set(e, i);
	}
	_remove(e, t) {
		this._set(e, this._r[e].filter((e, n) => n !== t));
	}
	_blocks(e, t, n, r) {
		let i = this.t, a = this._r[e], o = (t) => T`<span class="tools">
      <button class="x" title="▲" @click=${() => this._set(e, Ir(a, t, -1))}>▲</button>
      <button class="x" title="▼" @click=${() => this._set(e, Ir(a, t, 1))}>▼</button>
      ${e === "steps" ? T`<button class="x" title=${i("makeHeading")} @click=${() => this._set(e, zr(a, t))}>H</button>` : E}
      <button class="x del" title=${i("remove")} @click=${() => this._remove(e, t)}>×</button>
    </span>`;
		return T`
      ${Pr(a).map((s, c) => T`<div class="block ${s.section ? "named" : ""}">
          <div class="row">
            <itadaki-text class="block-title" .value=${s.section || ""} placeholder=${i("sectionPlaceholder")}
              @change=${(t) => this._set(e, Fr(a, s, t.target.value))}></itadaki-text>
            ${e === "steps" && s.section ? T`<button class="x" title=${i("headingToStep")} @click=${() => this._set(e, Br(a, s))}>↧</button>` : E}
          </div>
          <div class="items" data-list=${e} data-block=${c}>
            ${xt(a.slice(s.start, s.end + 1), (e) => e._key, (e, n) => T`<div class="item">
                <span class="handle" title=${i("drag")}>⋮⋮</span>${t(e, s.start + n, o(s.start + n))}
              </div>`)}
          </div>
          <button class="btn quiet" @click=${() => this._set(e, Lr(a, s, Wr(n())))}>+ ${r}</button>
        </div>`)}
      <button class="btn quiet" @click=${() => {
			let t = a.length ? prompt(i("newSection"))?.trim() : null;
			t !== void 0 && t !== "" && this._set(e, [...a, Wr({
				...n(),
				section: t
			})]);
		}}>+ ${a.length ? i("addSection") : r}</button>
    `;
	}
	render() {
		let e = this.t, t = this._r, n = t.language, r = [...this.ingredients, ...this._new].sort((e, t) => $(e, n).localeCompare($(t, n))), i = [...this.units].sort((e, t) => $(e, n).localeCompare($(t, n))), a = (e, n, r = "text") => T`<div>
      <label>${n}</label>
      ${r === "number" ? T`<input type="number" .value=${t[e] ?? ""} @input=${(t) => this._set(e, Hr(t.target.value))} />` : T`<itadaki-text .value=${t[e] ?? ""} @input=${(t) => this._set(e, t.target.value)}></itadaki-text>`}
    </div>`, o = Cr(n, Sr(this.languages, n, this.uiLang)), s = [.../* @__PURE__ */ new Set([n, ...this.languages])], c = new Map(r.map((e) => [e.id, e])), l = this.newIngredientsUsed;
		return T`
      <div class="card about"><div class="split"><div>
        ${a("title", e("title"))}
        ${this.fixedLanguage ? E : this._languagePicker()}
        <label>${e("description")}</label>
        <textarea rows="2" .value=${t.description || ""} @input=${(e) => this._set("description", e.target.value)}></textarea>
        <div class="grid2">
          ${a("servings", e("servings"), "number")}
          ${a("prep_minutes", e("prepMinutes"), "number")}
          ${a("cook_minutes", e("cookMinutes"), "number")}
          ${a("total_minutes", e("totalMinutes"), "number")}
        </div>
      </div><div>${this._photo()}</div></div></div>

      ${l.length ? T`<div class="card">
            <h2>${e("newIngredients")}</h2>
            <div class="muted">${e("newIngredientsExplain")}</div>
            <div class="names head">
              ${s.map((t) => T`<label>${e.langName(t)}${t === n ? T` · ${e("usedAs")}` : E}</label>`)}
            </div>
            ${xt(l, (e) => e.id, (e) => T`<div class="names">
                ${s.map((t) => T`<itadaki-text .value=${e.localized[t]?.name || ""}
                    @change=${(n) => this._rename(e.id, t, n.target.value)}></itadaki-text>`)}
              </div>`)}
          </div>` : E}

      <div class="card">
        <h2>${e("ingredients")}</h2>
        <div class="line head">
          <span>${e("ingredient")}</span><span>${e("amount")}</span>
          <span>${e("unit")}</span><span>${e("lineNote")}</span><span></span>
        </div>
        ${this._blocks("ingredients", (t, a, s) => T`<div class="line">
                ${t._raw ? T`<div class="raw muted">${t._raw}</div>` : E}
                <itadaki-combo .entries=${r} .hint=${o} value=${t.ingredient_id ?? ""}
                  .label=${c.has(t.ingredient_id) ? $(c.get(t.ingredient_id), n) : ""}
                  ?invalid=${!c.has(t.ingredient_id)} placeholder=${e("ingredientSearch")} createLabel=${e("create")}
                  @pick=${(e) => this._setItem("ingredients", a, "ingredient_id", e.detail.id)}
                  @create=${(e) => this._create(a, e.detail.name)}></itadaki-combo>
                <input type="number" step="any" .value=${Vr(t.quantity) ?? ""} placeholder=${e("amount")}
                  @input=${(e) => this._setItem("ingredients", a, "quantity", Hr(e.target.value))} />
                <select @change=${(e) => this._setItem("ingredients", a, "unit_id", e.target.value || null)}>
                  <option value="" ?selected=${!t.unit_id}>—</option>
                  ${i.map((e) => T`<option value=${e.id} ?selected=${e.id === t.unit_id}>${$(e, n)}</option>`)}
                </select>
                <itadaki-text .value=${t.note || ""} placeholder=${e("lineNote")}
                  @input=${(e) => this._setItem("ingredients", a, "note", Kr(e.target.value))}></itadaki-text>
                ${s}
              </div>`, () => ({
			ingredient_id: null,
			quantity: null,
			unit_id: null,
			note: null
		}), e("addLine"))}
      </div>

      <div class="card">
        <h2>${e("steps")}</h2>
        ${this._blocks("steps", (e, t, n) => T`<div class="step">
            <textarea rows="2" .value=${e.text} @input=${(e) => this._setItem("steps", t, "text", e.target.value)}></textarea>
            ${n}
          </div>`, () => ({ text: "" }), e("addStep"))}
      </div>

      <div class="card">
        <label>${e("notes")}</label>
        <textarea rows="3" .value=${t.notes || ""} @input=${(e) => this._set("notes", e.target.value)}></textarea>
        <label>${e("tags")}</label>
        <itadaki-text .value=${(t.tags || []).join(", ")}
          @change=${(e) => this._set("tags", e.target.value.split(",").map((e) => e.trim()).filter(Boolean))}></itadaki-text>
      </div>
    `;
	}
};
customElements.define("itadaki-editor", qr);
// src/views/draft.js
var Jr = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		languages: { attribute: !1 },
		draftId: {},
		_entry: { state: !0 },
		_catalog: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O, o`
      .head { margin-bottom: 16px; }
      .actions { margin: 16px 0; }
    `];
	connectedCallback() {
		super.connectedCallback(), this._unsubscribe = this.api.subscribeDrafts((e) => {
			e.draft_id === this.draftId && (e.status === "saved" ? k(this, {
				view: "recipe",
				id: e.recipe_id,
				replace: !0
			}) : this._load());
		});
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._unsubscribe?.then((e) => e());
	}
	updated(e) {
		e.has("draftId") && this._load();
	}
	async _load() {
		try {
			let e = await this.api.call("get_draft", { draft_id: this.draftId });
			if (e.status === "ready" && !this._catalog) {
				let [e, t] = await Promise.all([this.api.call("list_ingredients"), this.api.call("list_units")]);
				this._catalog = {
					ingredients: e.ingredients,
					units: t.units
				};
			}
			this._entry = e, this._error = void 0;
		} catch (e) {
			this._error = e.message;
		}
	}
	async _save() {
		let e = this.renderRoot.querySelector("itadaki-editor"), t = {
			...structuredClone(this._entry.draft),
			recipe: e.value,
			new_ingredients: e.newIngredientsUsed,
			raw_lines: []
		};
		await this._act(async () => {
			let { recipe: e } = await this.api.call("save_draft", {
				draft_id: this.draftId,
				draft: t
			});
			k(this, {
				view: "recipe",
				id: e.id,
				replace: !0
			});
		});
	}
	async _discard() {
		await this._act(async () => {
			await this.api.call("discard_draft", { draft_id: this.draftId }), k(this, { view: "back" });
		});
	}
	async _act(e) {
		this._busy = !0, this._error = void 0;
		try {
			await e();
		} catch (e) {
			this._error = e.message;
		} finally {
			this._busy = !1;
		}
	}
	render() {
		return T`<itadaki-page .t=${this.t} header=${this._entry ? this.t.action(this._entry.action) : ""}>${this._content()}</itadaki-page>`;
	}
	_content() {
		let e = this.t, t = this._entry;
		if (!t) return this._error ? T`<div class="error">${this._error}</div>` : T`<itadaki-busy></itadaki-busy>`;
		let n = t.draft, r = t.status === "ready";
		if (!n) return T`
        <div class="card head">
          <h2>${t.title}</h2>
          ${this._request(t)}
          ${t.status === "working" ? T`<itadaki-busy .text=${e("workingLeave")}></itadaki-busy>` : E}
          ${t.error ? T`<div class="error">${t.error}</div>` : E}
          ${t.status === "failed" ? T`<button class="btn quiet" @click=${this._discard}>${e("discard")}</button>` : E}
        </div>
      `;
		let i = n.recipe, a = {
			...i,
			ingredients: [...i.ingredients, ...n.raw_lines.map((e) => ({ section: e.section }))]
		}, o = [...t.lines_text || [], ...n.raw_lines.map((e) => e.text)];
		return r ? this._renderReview(n) : T`
      <div class="card head">
        <h2>${t.title}</h2>
        ${this._request(t)}
        ${t.status === "working" ? T`<itadaki-busy .text=${n.raw_lines.length ? e("structuring") : e("workingLeave")}></itadaki-busy>` : E}
        ${t.error ? T`<div class="error">${t.error}</div>` : E}
        ${t.status === "failed" ? T`<button class="btn quiet" @click=${this._discard}>${e("discard")}</button>` : E}
      </div>
      <itadaki-body .recipe=${a} .lines=${o} .t=${e}></itadaki-body>
    `;
	}
	_request(e) {
		let t = this.t, n = et(t, e);
		return T`<div class="muted" style="margin-bottom:8px">${t.action(e.action)}${n ? T` · ${n}` : E}</div>`;
	}
	_renderReview(e) {
		let t = this.t, n = {
			...e.recipe,
			ingredients: [...e.recipe.ingredients, ...e.raw_lines.map((e) => ({
				ingredient_id: null,
				quantity: null,
				unit_id: null,
				note: null,
				section: e.section,
				_raw: e.text
			}))]
		};
		return T`
      <div class="card head">
        <h2>${t("review")} · ${t.langName(n.language)}</h2>
        ${this._request(this._entry)}
        <div class="muted" style="font-size:0.8rem">
          ${t("tokens", {
			in: e.usage.prompt_tokens,
			out: e.usage.completion_tokens
		})}
        </div>
      </div>

      <itadaki-editor .api=${this.api} .languages=${this.languages} .recipe=${n} .t=${t} uiLang=${this.lang} .units=${this._catalog.units}
        .ingredients=${this._catalog.ingredients} .newIngredients=${e.new_ingredients}
        ?fixedLanguage=${!!(e.updates_id || e.parent_id)}></itadaki-editor>

      <div class="row actions">
        <button class="btn" ?disabled=${this._busy} @click=${this._save}>${t("save")}</button>
        <button class="btn quiet" ?disabled=${this._busy} @click=${this._discard}>${t("discard")}</button>
      </div>
      ${this._busy ? T`<itadaki-busy></itadaki-busy>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
    `;
	}
};
customElements.define("itadaki-draft", Jr);
// src/views/edit.js
var Yr = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		languages: { attribute: !1 },
		recipeId: {},
		_data: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O];
	willUpdate(e) {
		(e.has("recipeId") || !this.hasUpdated) && this._load();
	}
	_blank() {
		return {
			language: this.languages.includes(this.lang) ? this.lang : this.languages[0],
			title: "",
			description: "",
			servings: null,
			prep_minutes: null,
			cook_minutes: null,
			total_minutes: null,
			ingredients: [],
			steps: [],
			notes: "",
			tags: [],
			image_url: null,
			source_url: null
		};
	}
	async _load() {
		try {
			let [e, t, n] = await Promise.all([
				this.recipeId ? this.api.call("get_recipe", { recipe_id: this.recipeId }).then((e) => e.recipe) : this._blank(),
				this.api.call("list_ingredients"),
				this.api.call("list_units")
			]);
			this._data = {
				recipe: e,
				ingredients: t.ingredients,
				units: n.units
			};
		} catch (e) {
			this._error = e.message;
		}
	}
	async _save() {
		let e = this.renderRoot.querySelector("itadaki-editor"), t = {
			recipe: e.value,
			updates_id: this.recipeId,
			new_ingredients: e.newIngredientsUsed
		};
		this._busy = !0, this._error = void 0;
		try {
			let { recipe: e } = await this.api.call("apply_draft", { draft: t });
			k(this, this.recipeId ? { view: "back" } : {
				view: "recipe",
				id: e.id,
				replace: !0
			});
		} catch (e) {
			this._error = e.message;
		} finally {
			this._busy = !1;
		}
	}
	render() {
		return T`<itadaki-page .t=${this.t} header=${this.t(this.recipeId ? "edit" : "newRecipe")}>${this._content()}</itadaki-page>`;
	}
	_content() {
		let e = this.t;
		return this._data ? T`
      <itadaki-editor .api=${this.api} .languages=${this.languages} .recipe=${this._data.recipe} uiLang=${this.lang} .ingredients=${this._data.ingredients}
        .units=${this._data.units} .t=${e} ?fixedLanguage=${!!this.recipeId}></itadaki-editor>
      <div class="row" style="margin:16px 0">
        <button class="btn" ?disabled=${this._busy} @click=${this._save}>${e("save")}</button>
        <button class="btn quiet" ?disabled=${this._busy}
          @click=${() => k(this, { view: "back" })}>
          ${e("cancel")}</button>
      </div>
      ${this._busy ? T`<itadaki-busy></itadaki-busy>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
    ` : this._error ? T`<div class="error">${this._error}</div>` : T`<itadaki-busy></itadaki-busy>`;
	}
};
customElements.define("itadaki-edit", Yr);
// src/views/entry.js
var Xr = [
	"mass",
	"volume",
	"count",
	"other"
], Zr = [
	"metric",
	"us",
	"imperial",
	"japanese"
], Qr = (e) => e === "" || e == null ? null : Number(e), $r = (e) => e.split(/[,、]/).map((e) => e.trim()).filter(Boolean), ei = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		languages: { attribute: !1 },
		kind: {},
		entry: { attribute: !1 },
		entries: { attribute: !1 },
		usedBy: { attribute: !1 },
		_e: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O, o`
      :host { display: block; padding: 8px 0 16px; container-type: inline-size; }
      .lang { margin-bottom: 12px; }
      .lang-name { font-weight: 600; margin-top: 8px; }
      .fields { display: grid; gap: 0 12px; grid-template-columns: 1fr; }
      @container (min-width: 560px) {
        .fields { grid-template-columns: 1fr 1fr 2fr; }
        .fields.single { grid-template-columns: 1fr 2fr; }
      }
      .grid2 { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
      .actions { margin-top: 16px; }
      .merge { margin-top: 16px; max-width: 420px; }
    `];
	willUpdate(e) {
		if (e.has("entry")) {
			let e = structuredClone(this.entry) || {
				localized: {},
				density: null,
				dimension: "other",
				factor: null,
				systems: []
			}, t = [.../* @__PURE__ */ new Set([...this.languages, ...Object.keys(e.localized)])];
			e.localized = Object.fromEntries(t.map((t) => {
				let n = e.localized[t];
				return [t, {
					name: n?.name || "",
					plural: n?.plural || "",
					aliases: (n?.aliases || []).join(", ")
				}];
			})), this._e = e;
		}
	}
	get _isUnit() {
		return this.kind === "units";
	}
	_set(e, t) {
		this._e = {
			...this._e,
			[e]: t
		};
	}
	_setName(e, t, n) {
		this._set("localized", {
			...this._e.localized,
			[e]: {
				...this._e.localized[e],
				[t]: n
			}
		});
	}
	_payload() {
		let e = this._e, t = Object.fromEntries(Object.entries(e.localized).map(([e, t]) => [e, t.name.trim() ? {
			name: t.name.trim(),
			plural: Er(e) && t.plural.trim() || null,
			aliases: $r(t.aliases)
		} : null])), n = Object.values(t).find(Boolean)?.name ?? "", r = this.entry?.id ?? Mr(n, new Set(this.entries.map((e) => e.id)));
		if (!this._isUnit) return {
			id: r,
			localized: t,
			density: Qr(e.density)
		};
		let i = e.dimension;
		return {
			id: r,
			localized: t,
			dimension: i,
			factor: i === "other" ? null : Qr(e.factor),
			systems: e.systems
		};
	}
	async _act(e) {
		this._busy = !0, this._error = void 0;
		try {
			await e(), this.dispatchEvent(new CustomEvent("changed"));
		} catch (e) {
			this._error = e.message;
		} finally {
			this._busy = !1;
		}
	}
	_save() {
		let [e, t] = this._isUnit ? ["upsert_unit", "unit"] : ["upsert_ingredient", "ingredient"];
		this._act(() => this.api.call(e, { [t]: this._payload() }));
	}
	_delete() {
		if (!confirm(this.t("confirmDeleteEntry", { name: $(this.entry, this.lang) }))) return;
		let [e, t] = this._isUnit ? ["delete_unit", "unit_id"] : ["delete_ingredient", "ingredient_id"];
		this._act(() => this.api.call(e, { [t]: this.entry.id }));
	}
	_merge(e) {
		let t = this.entries.find((t) => t.id === e), n = {
			from: $(this.entry, this.lang),
			to: $(t, this.lang)
		};
		if (!confirm(this.t("confirmMerge", n))) return;
		let r = this._isUnit ? "merge_unit" : "merge_ingredient";
		this._act(() => this.api.call(r, {
			source_id: this.entry.id,
			target_id: e
		}));
	}
	render() {
		let e = this.t, t = this._e, n = this.usedBy || [];
		return T`
      ${Object.entries(t.localized).map(([t, n]) => {
			let r = (e, r) => T`<div>
          <label>${r}</label>
          <itadaki-text .value=${n[e]} @input=${(n) => this._setName(t, e, n.target.value)}></itadaki-text>
        </div>`;
			return T`<div class="lang">
          <div class="lang-name">${e.langName(t)}</div>
          <div class="fields ${Er(t) ? "" : "single"}">
            ${r("name", e("name"))}
            ${Er(t) ? r("plural", e("plural")) : E}
            ${r("aliases", e("aliases"))}
          </div>
        </div>`;
		})}

      <div class="grid2">
        ${this._isUnit ? T`<div>
                <label>${e("dimension")}</label>
                <select @change=${(e) => this._set("dimension", e.target.value)}>
                  ${Xr.map((n) => T`<option value=${n} ?selected=${n === t.dimension}>${e(`dim_${n}`)}</option>`)}
                </select>
              </div>
              ${t.dimension === "other" ? E : T`<div>
                    <label>${e("factor", { base: wr[t.dimension] ?? e("items") })}</label>
                    <input type="number" step="any" .value=${t.factor ?? ""} @input=${(e) => this._set("factor", e.target.value)} />
                  </div>`}` : T`<div>
              <label>${e("density")}</label>
              <input type="number" step="any" .value=${t.density ?? ""} @input=${(e) => this._set("density", e.target.value)} />
            </div>`}
      </div>
      ${this._isUnit ? T`<label>${e("systems")}</label>
            <div class="row">
              ${Zr.map((n) => T`<button class="chip ${t.systems.includes(n) ? "active" : ""}"
                  @click=${() => this._set("systems", t.systems.includes(n) ? t.systems.filter((e) => e !== n) : [...t.systems, n])}>
                  ${e(`sys_${n}`)}</button>`)}
            </div>` : E}

      ${n.length ? T`<label>${e("usedBy", { n: n.length })}</label>
            <div class="row">
              ${n.map((e) => T`<button class="chip" @click=${() => k(this, {
			view: "recipe",
			id: e.id
		})}>${e.title}</button>`)}
            </div>` : E}

      <div class="row actions">
        <button class="btn" ?disabled=${this._busy} @click=${this._save}>${e("save")}</button>
        <button class="btn quiet" ?disabled=${this._busy} @click=${() => this.dispatchEvent(new CustomEvent("cancel"))}>${e("cancel")}</button>
        ${this.entry && !n.length ? T`<button class="btn danger" ?disabled=${this._busy} @click=${this._delete}>${e("delete")}</button>` : E}
      </div>

      ${this.entry ? T`<div class="merge">
            <label>${e("mergeInto")}</label>
            <itadaki-combo noCreate .entries=${this.entries.filter((e) => e.id !== this.entry.id)}
              .hint=${Cr(this.lang, Sr(this.languages, this.lang))} placeholder=${e("catalogSearch")}
              @pick=${(e) => this._merge(e.detail.id)}></itadaki-combo>
            <div class="muted" style="font-size:0.85rem;margin-top:6px">${e("mergeHint")}</div>
          </div>` : E}
      ${this._busy ? T`<itadaki-busy></itadaki-busy>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
    `;
	}
};
customElements.define("itadaki-entry", ei);
// src/views/catalog.js
var ti = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		languages: { attribute: !1 },
		kind: {},
		_entries: { state: !0 },
		_usage: { state: !0 },
		_query: { state: !0 },
		_open: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O, o`
      .tools { display: flex; gap: 12px; margin-bottom: 20px; }
      .tools itadaki-text { flex: 1; }
      .card { padding: 0; overflow-x: auto; container-type: inline-size; }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; font-weight: 600; font-size: 0.8rem; color: var(--it-muted); white-space: nowrap; }
      th, td { padding: 10px 12px; vertical-align: top; }
      th:first-child, td:first-child { padding-left: 20px; }
      tbody tr { border-top: 1px solid var(--it-divider); }
      tr.entry { cursor: pointer; }
      tr.entry:hover, tr.entry.open { background: var(--it-soft); }
      tr.form { border-top: none; }
      tr.form td { padding: 0 0 8px; }
      /* The table may scroll sideways; its form stays within the visible width. */
      .pinned { position: sticky; left: 20px; width: calc(100cqw - 40px); }
      .name { font-weight: 600; }
      .aliases { color: var(--it-muted); font-size: 0.9rem; min-width: 120px; }
      .num { white-space: nowrap; }
    `];
	connectedCallback() {
		super.connectedCallback(), this._query = "";
	}
	willUpdate(e) {
		e.has("kind") && (this._entries = void 0, this._open = void 0, this._load());
	}
	get _isUnit() {
		return this.kind === "units";
	}
	async _load() {
		let e = this._isUnit ? "list_units" : "list_ingredients";
		try {
			let [t, n] = await Promise.all([this.api.call(e), this.api.call("catalog_usage")]);
			this._entries = t[this.kind].sort((e, t) => $(e, this.lang).localeCompare($(t, this.lang))), this._usage = n[this.kind], this._error = void 0;
		} catch (e) {
			this._error = e.message;
		}
	}
	_changed() {
		this._open = void 0, this._load();
	}
	_toggle(e) {
		this._open = this._open === e ? void 0 : e;
	}
	_form(e) {
		return T`<itadaki-entry .api=${this.api} .t=${this.t} lang=${this.lang} .languages=${this.languages} kind=${this.kind} .entry=${e}
      .entries=${this._entries} .usedBy=${e ? this._usage[e.id] : []}
      @changed=${this._changed} @cancel=${() => this._open = void 0}></itadaki-entry>`;
	}
	_columns() {
		let e = this.t;
		return this._isUnit ? {
			heads: [
				e("dimension"),
				e("size"),
				e("systems")
			],
			cells: (t) => [
				e(`dim_${t.dimension}`),
				t.factor == null ? "" : `${t.factor} ${wr[t.dimension] ?? e("items")}`,
				t.systems.map((t) => e(`sys_${t}`)).join(", ")
			]
		} : {
			heads: [e("density")],
			cells: (e) => [e.density ?? ""]
		};
	}
	render() {
		return T`<itadaki-page .t=${this.t} header=${this.t(this.kind)}>${this._content()}</itadaki-page>`;
	}
	_content() {
		let e = this.t, t = this._entries ? Ar(this._entries, this._query, Infinity) : [], n = this.languages.includes(this.lang) ? [this.lang, ...this.languages.filter((e) => e !== this.lang)] : this.languages, r = this._columns(), i = n.length * 2 + r.heads.length + 1;
		return T`
      <div class="tools">
        <itadaki-text .value=${this._query} placeholder=${e("catalogSearch")} @input=${(e) => this._query = e.target.value}></itadaki-text>
        <button class="btn" @click=${() => this._toggle("new")}>+ ${e("newEntry")}</button>
      </div>
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
      ${this._open === "new" ? T`<div class="card" style="margin-bottom:16px;padding:20px">${this._form(null)}</div>` : E}
      ${this._entries ? T`<div class="card">
            <table>
              <thead>
                <tr>
                  ${n.map((t) => T`<th>${e.langName(t)}</th><th>${e("otherNames")}</th>`)}
                  ${r.heads.map((e) => T`<th>${e}</th>`)}
                  <th>${e("recipes")}</th>
                </tr>
              </thead>
              <tbody>
                ${t.map((t) => T`
                    <tr class="entry ${this._open === t.id ? "open" : ""}" @click=${() => this._toggle(t.id)}>
                      ${n.map((e) => {
			let n = t.localized[e];
			return T`<td>
                            <span class="name">${n?.name ?? ""}</span>
                            ${n?.plural ? T`<span class="muted"> · ${n.plural}</span>` : E}
                          </td>
                          <td class="aliases">${(n?.aliases || []).join(", ")}</td>`;
		})}
                      ${r.cells(t).map((e) => T`<td class="num">${e}</td>`)}
                      <td class="num">${this._usage[t.id]?.length || T`<span class="muted">${e("unused")}</span>`}</td>
                    </tr>
                    ${this._open === t.id ? T`<tr class="form"><td colspan=${i}><div class="pinned">${this._form(t)}</div></td></tr>` : E}
                  `)}
              </tbody>
            </table>
          </div>` : E}
    `;
	}
};
customElements.define("itadaki-catalog", ti);
// src/views/manage.js
var ni = [[{
	target: {
		view: "catalog",
		id: "ingredients"
	},
	key: "ingredients",
	icon: "list"
}, {
	target: {
		view: "catalog",
		id: "units"
	},
	key: "units",
	icon: "ruler"
}], [{
	target: { view: "languages" },
	key: "languages",
	icon: "translate"
}, {
	target: { view: "ai" },
	key: "ai",
	icon: "adapt"
}]], ri = class extends D {
	static properties = { t: { attribute: !1 } };
	static styles = [O, o`
      .card { max-width: 640px; margin: 0 auto; padding: 8px 0; }
      .item {
        display: flex; align-items: center; gap: 16px; width: 100%; padding: 12px 16px;
        background: none; border: none; font: inherit; color: inherit; text-align: left; cursor: pointer;
      }
      .item:hover { background: var(--it-soft); }
      .badge { display: flex; padding: 8px; border-radius: 50%; background: var(--it-soft); color: var(--it-accent); }
      .badge svg, .chevron svg { width: 24px; height: 24px; fill: currentColor; }
      .name { flex: 1; min-width: 0; font-weight: 500; }
      hr { border: none; border-top: 1px solid var(--it-divider); margin: 8px 0; }
      .chevron { display: flex; color: var(--it-muted); }
    `];
	render() {
		let e = this.t;
		return T`
      <itadaki-page .t=${e} header=${e("manage")}>
        <div class="card">
          ${ni.map((t, n) => T`${n ? T`<hr />` : E}${t.map((t) => T`<button class="item" @click=${() => k(this, t.target)}>
                <span class="badge">${Ze(t.icon)}</span>
                <span class="name">${e(t.key)}</span>
                <span class="chevron">${Ze("chevron")}</span>
              </button>`)}`)}
        </div>
      </itadaki-page>
    `;
	}
};
customElements.define("itadaki-manage", ri);
// src/views/languages.js
var ii = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		languages: { attribute: !1 },
		_code: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O, o`
      .card { max-width: 640px; margin: 0 auto; }
      .lang { display: flex; align-items: center; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--it-divider); }
      .lang .name { flex: 1; }
      .lang .icon { padding: 8px; }
      .add { margin-top: 16px; flex-wrap: nowrap; }
      .add itadaki-text { flex: 1; }
    `];
	constructor() {
		super(), this._code = "";
	}
	async _save(e) {
		this._busy = !0, this._error = void 0;
		try {
			let t = await this.api.call("update_settings", { languages: e });
			this._code = "", this.dispatchEvent(new CustomEvent("settings-changed", {
				detail: { languages: t.languages },
				bubbles: !0,
				composed: !0
			}));
		} catch (e) {
			this._error = e.message;
		} finally {
			this._busy = !1;
		}
	}
	render() {
		let e = this.t, t = this._code.trim().toLowerCase();
		return T`
      <itadaki-page .t=${e} header=${e("languages")}>
        <div class="card">
          <div class="muted" style="margin-bottom:12px">${e("languagesHint")}</div>
          ${this.languages.map((t) => T`<div class="lang">
              <span class="name">${e.langName(t)}</span>
              <span class="muted">${t}</span>
              <button class="icon" ?disabled=${this._busy || this.languages.length === 1} aria-label=${e("remove")} title=${e("remove")}
                @click=${() => this._save(this.languages.filter((e) => e !== t))}>${Ze("close")}</button>
            </div>`)}
          <div class="row add">
            <itadaki-text .value=${this._code} placeholder=${e("languageCode")} @input=${(e) => this._code = e.target.value}></itadaki-text>
            <button class="btn" ?disabled=${this._busy || !t || this.languages.includes(t)}
              @click=${() => this._save([...this.languages, t])}>${e("add")}</button>
          </div>
          ${t ? T`<div class="muted" style="margin-top:6px">${e.langName(t)}</div>` : E}
          ${this._error ? T`<div class="error">${this._error}</div>` : E}
        </div>
      </itadaki-page>
    `;
	}
};
customElements.define("itadaki-languages", ii);
// src/views/ai.js
var ai = [
	"extract",
	"structure",
	"translate",
	"adapt"
], oi = [
	"schema",
	"json",
	"off"
], si = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		_s: { state: !0 },
		_key: { state: !0 },
		_extra: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 },
		_saved: { state: !0 }
	};
	static styles = [O, o`
      .card { max-width: 640px; margin: 0 auto; }
      .status { margin: 12px 0 4px; font-weight: 500; }
      details { margin-top: 16px; }
      summary { cursor: pointer; color: var(--it-muted); }
      textarea { font-family: monospace; font-size: 0.85rem; }
      .hint { font-size: 0.8rem; margin-top: 4px; word-break: break-all; }
      .actions { margin-top: 20px; }
    `];
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			this._show(await this.api.call("get_ai_settings"));
		} catch (e) {
			this._error = e.message;
		}
	}
	_show(e) {
		this._s = e, this._key = "", this._extra = Object.keys(e.extra_body).length ? JSON.stringify(e.extra_body, null, 2) : "";
	}
	_set(e, t) {
		this._saved = !1, this._s = {
			...this._s,
			[e]: t
		};
	}
	async _save() {
		let e;
		try {
			if (e = this._extra.trim() ? JSON.parse(this._extra) : {}, typeof e != "object" || Array.isArray(e) || e === null) throw Error();
		} catch {
			this._error = this.t("invalidJson");
			return;
		}
		let t = this._s, n = {
			base_url: t.base_url,
			model: t.model,
			models: t.models,
			structured_output: t.structured_output,
			extra_body: e,
			...this._key.trim() ? { api_key: this._key.trim() } : {}
		};
		this._busy = !0, this._error = void 0;
		try {
			let e = await this.api.call("update_ai_settings", n);
			this._show(e), this._saved = !0, this.dispatchEvent(new CustomEvent("settings-changed", {
				detail: { ai: e.enabled },
				bubbles: !0,
				composed: !0
			}));
		} catch (e) {
			this._error = e.message;
		} finally {
			this._busy = !1;
		}
	}
	render() {
		let e = this.t;
		return T`<itadaki-page .t=${e} header=${e("ai")}>${this._s ? this._form() : this._error ? T`<div class="error">${this._error}</div>` : T`<itadaki-busy></itadaki-busy>`}</itadaki-page>`;
	}
	_form() {
		let e = this.t, t = this._s, n = (e, n, r = "text") => T`<label>${n}</label>
      <itadaki-text type=${r} .value=${t[e]} @input=${(t) => this._set(e, t.target.value)}></itadaki-text>`;
		return T`
      <div class="card">
        <div class="muted">${e("aiHint")}</div>
        <div class="status">${t.enabled ? e("aiOn") : e("aiOff")}</div>
        ${n("base_url", e("apiUrl"), "url")}
        <label>${e("apiKey")}</label>
        <itadaki-text type="password" .value=${this._key} @input=${(e) => (this._key = e.target.value, this._saved = !1)}></itadaki-text>
        ${t.api_key_set ? T`<div class="muted hint">${e("apiKeySet")}</div>` : E}
        ${n("model", e("model"))}

        <details>
          <summary>${e("advanced")}</summary>
          <label>${e("jsonMode")}</label>
          <select @change=${(e) => this._set("structured_output", e.target.value)}>
            ${oi.map((n) => T`<option value=${n} ?selected=${n === t.structured_output}>${e(`json_${n}`)}</option>`)}
          </select>
          <label>${e("extraBody")}</label>
          <textarea rows="3" .value=${this._extra} @input=${(e) => (this._extra = e.target.value, this._saved = !1)}></textarea>
          <div class="muted hint">${e("extraBodyHint")}</div>
          ${ai.map((n) => T`<label>${e("modelFor", { action: e(`task_${n}`) })}</label>
              <itadaki-text .value=${t.models[n] || ""} placeholder=${e("modelDefault")}
                @input=${(e) => this._set("models", {
			...t.models,
			[n]: e.target.value.trim()
		})}></itadaki-text>`)}
        </details>

        <div class="row actions">
          <button class="btn" ?disabled=${this._busy} @click=${this._save}>${e("save")}</button>
          ${this._saved ? T`<span class="muted">${e("saved")}</span>` : E}
        </div>
        ${this._busy ? T`<itadaki-busy></itadaki-busy>` : E}
        ${this._error ? T`<div class="error">${this._error}</div>` : E}
      </div>
    `;
	}
};
customElements.define("itadaki-ai", si);
// src/main.js
var ci = /* @__PURE__ */ new Set([
	"manage",
	"languages",
	"catalog",
	"ai"
]), li = class extends D {
	static properties = {
		hass: { attribute: !1 },
		narrow: { type: Boolean },
		route: { attribute: !1 },
		_settings: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O, o`
      :host { display: block; min-height: 100vh; background: var(--primary-background-color, #f2f2f7); }
    `];
	constructor() {
		super(), this.api = We(() => this.hass);
	}
	willUpdate() {
		this.hass && !this._loading && (this._loading = Promise.all([this.api.call("get_settings"), this.api.call("get_ai_settings")]).then(([e, t]) => this._settings = {
			languages: e.languages,
			ai: t.enabled
		}).catch((e) => this._error = e.message));
	}
	get _prefix() {
		return this.route?.prefix ?? "/itadaki";
	}
	_navigate(e) {
		let { view: t, replace: n } = e.detail;
		t === "back" ? Ye(this._prefix) : Je(this._prefix, e.detail, n);
	}
	render() {
		if (!this.hass) return E;
		let e = He(this.hass), t = Ue(e);
		return T`
      <div @navigate=${this._navigate} @settings-changed=${(e) => this._settings = {
			...this._settings,
			...e.detail
		}}>
        ${this._settings ? this._screen(qe(this.route?.path), t, e) : T`<itadaki-page .t=${t} home ?narrow=${this.narrow}>
              ${this._error ? T`<div class="error">${this._error}</div>` : E}
            </itadaki-page>`}
      </div>
    `;
	}
	_screen(e, t, n) {
		let { languages: r, ai: i } = this._settings, a = !!this.hass.user?.is_admin;
		switch (!a && ci.has(e.view) && (e = { view: "list" }), e.view) {
			case "recipe": return T`<itadaki-recipe .api=${this.api} .t=${t} lang=${n} .languages=${r} ?ai=${i} .recipeId=${e.id}></itadaki-recipe>`;
			case "import": return T`<itadaki-import .api=${this.api} .t=${t} ?ai=${i}></itadaki-import>`;
			case "new":
			case "edit": return T`<itadaki-edit .api=${this.api} .t=${t} lang=${n} .languages=${r} .recipeId=${e.id}></itadaki-edit>`;
			case "draft": return T`<itadaki-draft .api=${this.api} .t=${t} lang=${n} .languages=${r} .draftId=${e.id}></itadaki-draft>`;
			case "manage": return T`<itadaki-manage .t=${t}></itadaki-manage>`;
			case "languages": return T`<itadaki-languages .api=${this.api} .t=${t} .languages=${r}></itadaki-languages>`;
			case "ai": return T`<itadaki-ai .api=${this.api} .t=${t}></itadaki-ai>`;
			case "catalog": return T`<itadaki-catalog .api=${this.api} .t=${t} lang=${n} .languages=${r} kind=${e.id}></itadaki-catalog>`;
			default: return T`<itadaki-list .api=${this.api} .t=${t} lang=${n} ?narrow=${this.narrow} ?admin=${a}></itadaki-list>`;
		}
	}
};
customElements.define("itadaki-panel", li);
