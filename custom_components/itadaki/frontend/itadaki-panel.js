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
    /* Between rows of a list: lighter than the solid rule under a card's heading. */
    --it-row-rule: 1px dashed var(--it-divider);
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
  /* A card's heading is ruled off from its content. */
  .card > h2:first-child, .card > .head { padding-bottom: 12px; border-bottom: 1px solid var(--it-divider); }
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
  input[type="text"], input[type="url"], input[type="search"], input[type="password"], textarea {
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
  /* Home Assistant's extended floating action button, and room for it below the content. */
  .fab { position: fixed; z-index: 3; right: calc(16px + env(safe-area-inset-right));
    bottom: calc(16px + env(safe-area-inset-bottom)); display: flex; align-items: center; gap: 8px;
    height: 56px; padding: 0 20px 0 16px; border: none; border-radius: 16px; cursor: pointer;
    font: inherit; font-weight: 600; background: var(--it-accent); color: var(--it-on-accent);
    box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px rgba(0, 0, 0, 0.14); }
  .fab svg { width: 24px; height: 24px; fill: currentColor; }
  .fab-space { height: 72px; }
  .icon svg { width: 24px; height: 24px; fill: currentColor; }
  .banner {
    border-radius: 14px; padding: 12px 16px; margin-bottom: 16px;
    background: color-mix(in srgb, var(--it-warn) 18%, transparent);
  }
`, Ve = {
	en: {
		recipes: "Recipes",
		search: "Search recipes or tags",
		import: "Import",
		newRecipe: "New recipe",
		empty: "No recipes yet. Write one or import one from a web page to start.",
		back: "Back",
		ingredients: "Ingredients",
		steps: "Steps",
		notes: "Notes",
		variants: "Variants",
		minutes: "{n} min",
		variant: "Variant",
		stale: "The original changed since this translation was made.",
		retranslate: "Re-translate",
		keepTranslation: "Keep as is",
		keepTranslationHint: "This translation is still right: stop flagging it until the original changes again.",
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
		tags: "Tags",
		tagSearch: "Search or add a tag",
		tagFilter: "Filter by tag",
		closeSearch: "Close search",
		add: "Add",
		addRecipe: "Add recipe",
		writeTitle: "Write it yourself",
		writeHint: "Start from an empty recipe and type it in.",
		writeRecipe: "Write a recipe",
		noMatches: "No recipes match.",
		groupBy: "Group by",
		group_none: "No grouping",
		group_tag: "Tag",
		group_language: "Language",
		group_time: "Time",
		noTags: "No tags",
		noTime: "No time given",
		time_15: "Up to 15 min",
		time_30: "15 to 30 min",
		time_60: "30 to 60 min",
		time_Infinity: "Over an hour",
		ingredientTag: "ingredient",
		recipe_tags: "Recipe tags",
		ingredient_tags: "Ingredient tags",
		pageTags: "Tags from the page:",
		tagAi: "Suggest tags with AI",
		tagAiExplain: "Picks from your recipe tags, and adds up to three new ones when nothing fits. You review them before saving.",
		usedByIngredients: "Used by {n} ingredients",
		confirmDeleteTag: "Delete “{name}”? It is taken off the {n} it is on.",
		edit: "Edit",
		cook: "Cook",
		closeCooking: "Close cooking mode",
		cancel: "Cancel",
		usedAs: "In this recipe",
		newIngredientsExplain: "Saving adds these to your shared ingredient list, used by every recipe. To use an ingredient you already have instead, pick it on the right.",
		useExisting: "Or use existing",
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
			adapt: "Adaptation",
			tag: "Tags"
		},
		errors: {
			fetch_failed: "Could not open that page.",
			no_recipe_found: "No recipe found on that page.",
			ai_off: "AI is not set up.",
			image_too_large: "The image is larger than {mb} MB.",
			image_type: "Not a JPEG, PNG, WebP or GIF image.",
			language_codes: "Not language codes: {codes}",
			language_required: "At least one language is needed.",
			name_taken: "Already used by another entry: {names}",
			name_required: "Give it a name in at least one language.",
			title_required: "The recipe needs a title.",
			lines_unmatched: "Some ingredient lines are not matched to an ingredient yet.",
			ingredient_required: "Every ingredient line needs an ingredient.",
			entries_missing: "Some ingredients, units or tags no longer exist. Pick them again.",
			used_by_recipes: "Still used by: {titles}",
			used_by_drafts: "Still used by drafts: {titles}",
			recipe_not_found: "This recipe no longer exists.",
			draft_not_found: "This draft no longer exists.",
			todo_list_missing: "That to-do list no longer exists."
		},
		aiFailedKept: "The AI could not finish ({error}). The draft is kept as it was.",
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
		languagesHint: "Every ingredient, unit and tag is named in these languages, and recipes can be translated into them. Removing one keeps the names already written in it.",
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
		task_tag: "tags",
		saved: "Saved.",
		standing: "Standing instructions",
		standingNone: "None. An admin can set them under Manage, AI.",
		standingHint: "Sent with every run of that AI action, before the note you add when you run it. The note wins when the two disagree.",
		instructionsFor: "Instructions for {action}",
		instruction: "Instruction",
		importAi: "Import with AI",
		noRecipeData: "This page has no embedded recipe data. The AI can read the page text and write the recipe from it.",
		noRecipeDataNoAi: "This page has no embedded recipe data, so only the AI can import it, and AI is off.",
		structureAi: "Match ingredients with AI",
		matchTitle: "Ingredients to match: {n}",
		matchExplain: "These lines from the page are not linked to an ingredient yet. The recipe can be saved once every line is.",
		matchHowAi: "Let the AI match them, or pick each ingredient by hand in the list below.",
		matchHowHand: "Pick each ingredient in the list below; the page's text is shown above each line.",
		matchByHand: "Match by hand",
		adaptAi: "Adapt with AI",
		retranslateNote: "With a note, every text is translated again; without one, only the text that changed.",
		importNoAi: "AI is off, so only pages with embedded recipe data can be imported, and their ingredient lines are matched by hand in review.",
		yield: "Yield",
		people: "people",
		serves: "Serves {n}",
		makes: "Makes {measure}",
		scaled: "×{n}",
		resetScale: "Back to the recipe's amounts",
		amountFor: "Amount of {name}",
		yieldAmount: "Amount the recipe makes",
		toShoppingList: "Add to shopping list",
		shoppingList: "Shopping list",
		todoList: "To-do list",
		addN: "Add {n}",
		addedN: "Added {n} to {list}.",
		noTodoLists: "Home Assistant has no to-do list yet.",
		shoppingHint: "Where “Add to shopping list” puts ingredients, unless another list is picked when adding.",
		defaultList: "Default list"
	},
	ja: {
		recipes: "レシピ",
		search: "レシピやタグを検索",
		import: "取り込み",
		newRecipe: "新しいレシピ",
		empty: "レシピはまだありません。書くか、Webページから取り込んで始めましょう。",
		back: "戻る",
		ingredients: "材料",
		steps: "作り方",
		notes: "メモ",
		variants: "アレンジ",
		minutes: "{n}分",
		variant: "アレンジ",
		stale: "この翻訳の作成後に元のレシピが変更されました。",
		retranslate: "再翻訳",
		keepTranslation: "このままにする",
		keepTranslationHint: "この翻訳は正しいままです。元のレシピが再び変更されるまで表示しません。",
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
		tags: "タグ",
		tagSearch: "タグを検索・追加",
		tagFilter: "タグで絞り込む",
		closeSearch: "検索を閉じる",
		add: "追加",
		addRecipe: "レシピを追加",
		writeTitle: "自分で書く",
		writeHint: "空のレシピから入力します。",
		writeRecipe: "レシピを書く",
		noMatches: "条件に合うレシピはありません。",
		groupBy: "グループ分け",
		group_none: "グループなし",
		group_tag: "タグ",
		group_language: "言語",
		group_time: "時間",
		noTags: "タグなし",
		noTime: "時間の記載なし",
		time_15: "15分以内",
		time_30: "15〜30分",
		time_60: "30〜60分",
		time_Infinity: "1時間以上",
		ingredientTag: "材料",
		recipe_tags: "レシピのタグ",
		ingredient_tags: "材料のタグ",
		pageTags: "ページのタグ：",
		tagAi: "AIでタグを提案",
		tagAiExplain: "レシピのタグから選び、合うものがなければ新しいタグを最大3つ加えます。保存する前に確認できます。",
		usedByIngredients: "{n}件の材料で使用",
		confirmDeleteTag: "「{name}」を削除しますか？付いている{n}件から外されます。",
		edit: "編集",
		cook: "調理",
		closeCooking: "調理モードを閉じる",
		cancel: "キャンセル",
		usedAs: "このレシピでの表記",
		newIngredientsExplain: "保存すると、すべてのレシピで共有する材料リストに追加されます。既存の材料を使う場合は、右側で選んでください。",
		useExisting: "既存の材料を使う",
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
			adapt: "アレンジ",
			tag: "タグ"
		},
		errors: {
			fetch_failed: "そのページを開けませんでした。",
			no_recipe_found: "そのページにレシピが見つかりませんでした。",
			ai_off: "AIが設定されていません。",
			image_too_large: "画像が{mb} MBを超えています。",
			image_type: "JPEG、PNG、WebP、GIFの画像ではありません。",
			language_codes: "言語コードではありません：{codes}",
			language_required: "言語が少なくとも1つ必要です。",
			name_taken: "別の項目ですでに使われています：{names}",
			name_required: "少なくとも1つの言語で名前を付けてください。",
			title_required: "レシピにはタイトルが必要です。",
			lines_unmatched: "まだ材料に対応付けられていない材料行があります。",
			ingredient_required: "すべての材料行に材料が必要です。",
			entries_missing: "一部の材料・単位・タグが存在しなくなりました。選び直してください。",
			used_by_recipes: "まだ使われています：{titles}",
			used_by_drafts: "まだ下書きで使われています：{titles}",
			recipe_not_found: "このレシピはもう存在しません。",
			draft_not_found: "この下書きはもう存在しません。",
			todo_list_missing: "そのToDoリストはもう存在しません。"
		},
		aiFailedKept: "AIの処理が完了しませんでした（{error}）。下書きは元のまま残っています。",
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
		languagesHint: "すべての材料・単位・タグにこれらの言語で名前を付け、レシピはこれらの言語に翻訳できます。言語を外しても、その言語で書かれた名前は残ります。",
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
		task_tag: "タグ",
		saved: "保存しました。",
		standing: "常設の指示",
		standingNone: "なし。管理者が「管理」の「AI」で設定できます。",
		standingHint: "そのAI操作を実行するたびに、実行時に書くメモより前に送られます。両者が食い違う場合はメモが優先されます。",
		instructionsFor: "{action}の指示",
		instruction: "指示",
		importAi: "AIで取り込む",
		noRecipeData: "このページにはレシピデータが埋め込まれていません。AIがページの本文を読んでレシピを書き起こせます。",
		noRecipeDataNoAi: "このページにはレシピデータが埋め込まれていないため、AIでしか取り込めませんが、AIはオフです。",
		structureAi: "AIで材料を対応付ける",
		matchTitle: "対応付けが必要な材料：{n}",
		matchExplain: "ページから取り込んだこれらの行は、まだ材料に対応付けられていません。すべての行を対応付けると保存できます。",
		matchHowAi: "AIに対応付けさせるか、下の一覧で材料を一つずつ選んでください。",
		matchHowHand: "下の一覧で材料を一つずつ選んでください。各行の上にページの元の文が表示されています。",
		matchByHand: "手動で対応付ける",
		adaptAi: "AIでアレンジ",
		retranslateNote: "メモを付けるとすべての文を翻訳し直します。メモがなければ変更された文だけを翻訳します。",
		importNoAi: "AIがオフのため、レシピデータを含むページだけをインポートでき、材料行は確認画面で手動で対応付けます。",
		yield: "出来上がり量",
		people: "人分",
		serves: "{n}人分",
		makes: "{measure}分",
		scaled: "×{n}",
		resetScale: "元の分量に戻す",
		amountFor: "{name}の分量",
		yieldAmount: "出来上がり量",
		toShoppingList: "買い物リストに追加",
		shoppingList: "買い物リスト",
		todoList: "ToDoリスト",
		addN: "{n}件追加",
		addedN: "{list}に{n}件追加しました。",
		noTodoLists: "Home AssistantにToDoリストがまだありません。",
		shoppingHint: "「買い物リストに追加」で材料を入れるリストです。追加するときに別のリストも選べます。",
		defaultList: "既定のリスト"
	}
};
function He(e) {
	let t = (e?.locale?.language || e?.language || "en").split("-")[0];
	return Ve[t] ? t : "en";
}
function Ue(e) {
	let t = Ve[e], n = (e, t = {}) => String(e).replace(/\{(\w+)\}/g, (e, n) => t[n] ?? ""), r = (e, r) => n(t[e] ?? Ve.en[e] ?? e, r), i = new Intl.DisplayNames([e], { type: "language" });
	return r.langName = (e) => {
		try {
			return i.of(e);
		} catch {
			return e.toUpperCase();
		}
	}, r.status = (e) => t.status[e] || e, r.action = (e) => t.action[e] || e, r.error = (e) => t.errors[e?.key] ? n(t.errors[e.key], e.params) : e?.message || String(e), r;
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
				let t = (e?.message || String(e)).replace(/^Validation error: /, ""), n = e?.translation_domain === "itadaki";
				throw Object.assign(Error(t), n ? {
					key: e.translation_key,
					params: e.translation_placeholders
				} : {});
			}
		},
		subscribeDrafts(t) {
			return e().connection.subscribeMessage(t, { type: "itadaki/subscribe_drafts" });
		}
	};
}
// src/catalog.js
var Ge = {
	ingredients: {
		list: ["list_ingredients"],
		key: "ingredients",
		upsert: ["upsert_ingredient", "ingredient"],
		remove: ["delete_ingredient", "ingredient_id"],
		merge: "merge_ingredient"
	},
	units: {
		list: ["list_units"],
		key: "units",
		upsert: ["upsert_unit", "unit"],
		remove: ["delete_unit", "unit_id"],
		merge: "merge_unit"
	},
	recipe_tags: {
		list: ["list_tags", { kind: "recipe" }],
		key: "tags",
		upsert: ["upsert_tag", "tag"],
		remove: ["delete_tag", "tag_id"],
		merge: "merge_tag",
		tagKind: "recipe"
	},
	ingredient_tags: {
		list: ["list_tags", { kind: "ingredient" }],
		key: "tags",
		upsert: ["upsert_tag", "tag"],
		remove: ["delete_tag", "tag_id"],
		merge: "merge_tag",
		tagKind: "ingredient"
	}
};
async function Ke(e, t) {
	let { list: n, key: r } = Ge[t];
	return (await e.call(...n))[r];
}
function k(e, t) {
	let n = e.localized;
	return (n[t] || n.en || Object.values(n)[0])?.name || e.id;
}
function qe(e, t, n) {
	return n && n !== t ? n : e.find((e) => e !== t);
}
function Je(e, t) {
	return (n) => ({
		name: k(n, e),
		hint: n.localized[t]?.name ?? ""
	});
}
var Ye = {
	mass: "g",
	volume: "ml"
}, Xe = (e) => (t, n) => k(t, e).localeCompare(k(n, e)), Ze = /* @__PURE__ */ new Set([
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
]), Qe = (e) => !Ze.has(e.split("-")[0]);
// src/router.js
function $e({ view: e, id: t }) {
	switch (e) {
		case "recipe": return `/recipe/${t}`;
		case "edit": return `/recipe/${t}/edit`;
		case "draft": return `/draft/${t}`;
		case "new": return "/new";
		case "add": return "/add";
		case "manage": return "/manage";
		case "languages": return "/manage/languages";
		case "ai": return "/manage/ai";
		case "shopping": return "/manage/shopping";
		case "catalog": return `/manage/${t}`;
		default: return "";
	}
}
function et(e = "") {
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
	} : t === "new" ? { view: "new" } : t === "add" ? { view: "add" } : t === "manage" && (n === "languages" || n === "ai" || n === "shopping") ? { view: n } : t === "manage" ? Object.hasOwn(Ge, n ?? "") ? {
		view: "catalog",
		id: n
	} : { view: "manage" } : { view: "list" };
}
function tt(e, t, n = !1) {
	let r = history.state?.itadakiDepth ?? 0, i = e + $e(t);
	n ? history.replaceState({ itadakiDepth: r }, "", i) : history.pushState({ itadakiDepth: r + 1 }, "", i), window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: n } })), window.scrollTo(0, 0);
}
function nt(e) {
	(history.state?.itadakiDepth ?? 0) > 0 ? history.back() : tt(e, { view: "list" }, !0);
}
function A(e, t) {
	e.dispatchEvent(new CustomEvent("navigate", {
		detail: t,
		bubbles: !0,
		composed: !0
	}));
}
// src/icons.js
var rt = {
	back: "M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",
	menu: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
	group: "M2,2H14V5H2V2M6,7H22V9H6V7M6,10.5H22V12.5H6V10.5M2,15H14V18H2V15M6,20H22V22H6V20Z",
	cog: "M19.14 12.94c.04-.31.06-.62.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.48.48 0 0 0 13.92 2h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.72 8.47a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.07.63-.07.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.48.48 0 0 0-.12-.61zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z",
	edit: "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",
	adapt: "M7.5,5.6L5,7L6.4,4.5L5,2L7.5,3.4L10,2L8.6,4.5L10,7L7.5,5.6M19.5,15.4L22,14L20.6,16.5L22,19L19.5,17.6L17,19L18.4,16.5L17,14L19.5,15.4M22,2L20.6,4.5L22,7L19.5,5.6L17,7L18.4,4.5L17,2L19.5,3.4L22,2M13.34,12.78L15.78,10.34L13.66,8.22L11.22,10.66L13.34,12.78M14.37,7.29L16.71,9.63C17.1,10 17.1,10.65 16.71,11.04L5.04,22.71C4.65,23.1 4,23.1 3.63,22.71L1.29,20.37C0.9,20 0.9,19.35 1.29,18.96L12.96,7.29C13.35,6.9 14,6.9 14.37,7.29Z",
	delete: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
	translate: "M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07M18.5,10H16.5L12,22H14L15.12,19H19.87L21,22H23L18.5,10M15.88,17L17.5,12.67L19.12,17H15.88Z",
	list: "M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z",
	ruler: "M1.39,18.36L3.16,16.6L4.58,18L5.64,16.95L4.22,15.54L5.64,14.12L8.11,16.6L9.17,15.54L6.7,13.06L8.11,11.65L9.53,13.06L10.59,12L9.17,10.59L10.59,9.17L13.06,11.65L14.12,10.59L11.65,8.11L13.06,6.7L14.47,8.11L15.54,7.05L14.12,5.64L15.54,4.22L18,6.7L19.07,5.64L16.6,3.16L18.36,1.39L22.61,5.64L5.64,22.61L1.39,18.36Z",
	chevron: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",
	check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
	cook: "M12.5,1.5C10.73,1.5 9.17,2.67 8.67,4.37C8.14,4.13 7.58,4 7,4A4,4 0 0,0 3,8C3,9.82 4.24,11.41 6,11.87V19H19V11.87C20.76,11.41 22,9.82 22,8A4,4 0 0,0 18,4C17.42,4 16.86,4.13 16.33,4.37C15.83,2.67 14.27,1.5 12.5,1.5M12,10.5H13V17.5H12V10.5M9,12.5H10V17.5H9V12.5M15,12.5H16V17.5H15V12.5M6,20V21A1,1 0 0,0 7,22H18A1,1 0 0,0 19,21V20H6Z",
	tag: "M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.44 21.77,11.94 21.41,11.58Z",
	search: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",
	clock: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.95L16.25,16.18L11,13V7H12.5Z",
	plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
	cart: "M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z",
	close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
}, j = (e) => xe`<svg viewBox="0 0 24 24" aria-hidden="true"><path d=${rt[e]} /></svg>`, it = (e, t, n, r = !1) => T`<button slot="actions" class="icon"
  ?disabled=${r} aria-label=${t} title=${t} @click=${n}>${j(e)}</button>`, at = (e, t, n) => T`<button class="fab" @click=${n}>${j(e)}${t}</button>`, ot = class extends D {
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
      .title { flex: 1; min-width: 0; margin-left: 8px; }
      .text { display: block; font-size: 1.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .actions { display: flex; }
      ::slotted([slot="title"]) { font-size: 1rem; }
      main { max-width: 1100px; margin: 0 auto; padding: 16px; }
    `];
	render() {
		let e = this.t, t = E;
		return this.home ? this.narrow && (t = T`<button class="icon" aria-label="Menu"
        @click=${() => this.dispatchEvent(new Event("hass-toggle-menu", {
			bubbles: !0,
			composed: !0
		}))}>${j("menu")}</button>`) : t = T`<button class="icon" @click=${() => A(this, { view: "back" })} aria-label=${e("back")} title=${e("back")}>${j("back")}</button>`, T`
      <header>
        ${t}
        <div class="title"><slot name="title"><span class="text">${this.header ?? ""}</span></slot></div>
        <div class="actions"><slot name="actions"></slot></div>
      </header>
      <main><slot></slot></main>
    `;
	}
};
customElements.define("itadaki-page", ot);
// src/recipes.js
function st(e) {
	return e.total_minutes || (e.prep_minutes || 0) + (e.cook_minutes || 0);
}
// src/views/text.js
var ct = class extends D {
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
customElements.define("itadaki-text", ct);
// src/search.js
function lt(e) {
	return Object.values(e.localized).flatMap((e) => [
		e.name,
		e.plural,
		...e.aliases || []
	].filter(Boolean));
}
function ut(e, t, n = 8) {
	let r = t.trim().toLowerCase();
	if (!r) return e.slice(0, n);
	let i = [];
	for (let t of e) {
		let e = lt(t).map((e) => e.toLowerCase()), n = e.some((e) => e === r) ? 0 : e.some((e) => e.startsWith(r)) ? 1 : e.some((e) => e.includes(r)) ? 2 : -1;
		n >= 0 && i.push([n, t]);
	}
	return i.sort((e, t) => e[0] - t[0]).slice(0, n).map(([, e]) => e);
}
function dt(e, t) {
	let n = t.trim().toLowerCase();
	return e.find((e) => lt(e).some((e) => e.toLowerCase() === n));
}
function ft(e, t, n = "ingredient") {
	let r = e.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || n, i = r;
	for (let e = 2; t.has(i); e++) i = `${r}_${e}`;
	return i;
}
// src/views/combo.js
var pt = class extends D {
	static shadowRootOptions = {
		...D.shadowRootOptions,
		delegatesFocus: !0
	};
	static properties = {
		entries: { attribute: !1 },
		value: {},
		label: { attribute: !1 },
		hint: { attribute: !1 },
		placeholder: {},
		createLabel: {},
		noCreate: { type: Boolean },
		freeText: { type: Boolean },
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
			matches: t.trim() ? ut(this.entries, t) : [],
			create: !this.noCreate && !this.freeText && e && t.trim() && !dt(this.entries, t)
		};
	}
	_choose(e) {
		let { matches: t, create: n } = this._results();
		e < t.length ? this.dispatchEvent(new CustomEvent("pick", { detail: { id: t[e].id } })) : n && this.dispatchEvent(new CustomEvent("create", { detail: { name: this._query.trim() } })), this._open = !1, this._query = void 0, this.freeText ? this._text("") : this.renderRoot.querySelector("input").blur();
	}
	_text(e) {
		this.dispatchEvent(new CustomEvent("text", { detail: { value: e } }));
	}
	_key(e) {
		let { matches: t, create: n } = this._results(), r = t.length + +!!n;
		if (e.key === "ArrowDown") this._active = Math.min((this._active ?? -1) + 1, r - 1);
		else if (e.key === "ArrowUp") this._active = Math.max((this._active ?? 0) - 1, 0);
		else if (e.key === "Enter" && r && !(this.freeText && this._active === void 0)) this._choose(this._active ?? 0);
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
			this.freeText || e.target.select(), this._open = !!this.label, this._active = void 0;
		}}
        @blur=${() => {
			this._open = !1, this._query = void 0;
		}}
        @input=${(e) => {
			this._query = e.target.value, this._open = !!this._query.trim(), this._active = this.freeText ? void 0 : 0, this.freeText && this._text(this._query);
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
customElements.define("itadaki-combo", pt);
// src/views/tags.js
var mt = class extends D {
	static properties = {
		entries: { attribute: !1 },
		value: { attribute: !1 },
		lang: {},
		hint: { attribute: !1 },
		t: { attribute: !1 },
		placeholder: {},
		createLabel: {},
		freeText: { type: Boolean },
		text: {},
		only: {}
	};
	static styles = [O, o`
      :host { display: block; }
      .row { margin-bottom: 8px; }
      .x { background: none; border: none; color: inherit; cursor: pointer; padding: 0 0 0 4px; font: inherit; opacity: 0.6; }
      .x:hover { opacity: 1; }
    `];
	get _value() {
		return this.value || [];
	}
	_create(e) {
		let t = dt(this.entries || [], e);
		t ? this._value.includes(t.id) || this._fire([...this._value, t.id]) : this.dispatchEvent(new CustomEvent("create", { detail: { name: e } }));
	}
	focus() {
		this.renderRoot.querySelector("itadaki-combo")?.focus();
	}
	_key(e) {
		e.key === "Backspace" && !e.composedPath()[0].value && this._value.length && this._fire(this._value.slice(0, -1));
	}
	_fire(e) {
		this.dispatchEvent(new CustomEvent("change", { detail: { value: e } }));
	}
	render() {
		let e = this._value, t = new Map((this.entries || []).map((e) => [e.id, e]));
		return T`
      ${e.length && this.only !== "box" ? T`<div class="row">${e.map((n) => T`<span class="chip">
      ${t.has(n) ? k(t.get(n), this.lang) : n}
      <button class="x" aria-label=${this.t("remove")} title=${this.t("remove")}
        @click=${() => this._fire(e.filter((e) => e !== n))}>×</button>
    </span>`)}</div>` : E}
      ${this.only === "chips" ? E : T`<itadaki-combo .entries=${(this.entries || []).filter((t) => !e.includes(t.id))}
        .hint=${this.hint || Je(this.lang)} placeholder=${this.placeholder ?? ""}
        ?noCreate=${!this.createLabel} createLabel=${this.createLabel ?? E}
        ?freeText=${this.freeText} .label=${this.freeText ? this.text ?? "" : void 0} @keydown=${this._key}
        @text=${(e) => this.dispatchEvent(new CustomEvent("text", { detail: e.detail }))}
        @pick=${(t) => this._fire([...e, t.detail.id])}
        @create=${(e) => this._create(e.detail.name)}></itadaki-combo>`}
    `;
	}
};
customElements.define("itadaki-tags", mt);
// src/views/fit-chips.js
var ht = class extends D {
	static properties = { labels: { attribute: !1 } };
	static styles = [O, o`
      :host { display: block; min-width: 0; }
      .line { display: flex; gap: 4px; overflow: hidden; min-height: 1.4rem; }
      .chip { padding: 2px 8px; font-size: 0.75rem; flex-shrink: 0; white-space: nowrap; }
      .squeeze .chip:first-child { flex-shrink: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; display: block; }
      .chip.gone { display: none; }
      .more { background: none; color: var(--it-muted); padding: 2px 4px; }
    `];
	async connectedCallback() {
		super.connectedCallback(), await this.updateComplete, this.isConnected && (this._observer ??= new ResizeObserver(() => this._fit()), this._observer.observe(this.renderRoot.querySelector(".line")));
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._observer?.disconnect();
	}
	updated() {
		this._fit();
	}
	_fit() {
		let e = this.renderRoot.querySelector(".line"), t = [...e.querySelectorAll(".chip:not(.more)")], n = e.querySelector(".more");
		e.classList.remove("squeeze"), t.forEach((e) => e.classList.remove("gone")), n.classList.add("gone");
		let r = t.length;
		for (; r > 1 && e.scrollWidth > e.clientWidth;) t[--r].classList.add("gone"), n.classList.remove("gone"), n.textContent = `+${t.length - r}`, n.title = (this.labels || []).slice(r).join(", ");
		e.classList.add("squeeze");
	}
	render() {
		return T`<div class="line">
      ${(this.labels || []).map((e) => T`<span class="chip" title=${e}>${e}</span>`)}
      <span class="chip more gone"></span>
    </div>`;
	}
};
customElements.define("itadaki-fit-chips", ht);
// src/drafts.js
function gt(e, t) {
	let n = t.request || {}, r = [];
	if (t.action === "translate" && n.language && r.push(`→ ${e.langName(n.language)}`), n.instruction && r.push(`“${n.instruction}”`), t.action === "adapt" && n.as_variant && r.push(e("asNewVariant")), t.action === "import" && n.url) try {
		r.push(new URL(n.url).hostname.replace(/^www\./, ""));
	} catch {
		r.push(n.url);
	}
	return n.note && r.push(`“${n.note}”`), r.join(" · ");
}
// src/stored.js
function _t(e, t) {
	try {
		let n = localStorage.getItem(e);
		return n === null ? t : JSON.parse(n);
	} catch {
		return t;
	}
}
function vt(e, t) {
	try {
		t === void 0 ? localStorage.removeItem(e) : localStorage.setItem(e, JSON.stringify(t));
	} catch {}
}
// src/groups.js
var yt = [
	"none",
	"tag",
	"language",
	"time"
], bt = [
	15,
	30,
	60,
	Infinity
];
function xt(e, t, n) {
	if (t === "none") return [{
		key: "all",
		label: "",
		recipes: e
	}];
	let r = {
		tag: (e) => e.tags,
		language: (e) => [e.language],
		time: (e) => {
			let t = st(e);
			return t ? [bt.find((e) => t <= e)] : [];
		}
	}[t], i = /* @__PURE__ */ new Map(), a = [];
	for (let o of e) {
		let e = r(o).filter((e) => n(t, e) !== void 0);
		e.length || a.push(o);
		for (let r of e) i.has(r) || i.set(r, {
			key: r,
			label: n(t, r),
			recipes: []
		}), i.get(r).recipes.push(o);
	}
	let o = [...i.values()].sort(t === "time" ? (e, t) => e.key - t.key : (e, t) => e.label.localeCompare(t.label));
	return a.length && o.push({
		key: null,
		label: n(t, null),
		recipes: a
	}), o;
}
// src/views/menu.js
var St = class extends D {
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
        @click=${() => this._open = !this._open}>${j(this.icon)}</button>
      ${this._open ? T`<div class="list">
            ${this.items.map((e) => e === "-" ? T`<hr />` : T`<button class="item" @click=${() => this._pick(e)}>
                    <span class="mark">${e.active ? j("check") : E}</span>${e.label}</button>`)}
          </div>` : E}
    `;
	}
};
customElements.define("itadaki-menu", St);
// src/views/list.js
var Ct = {
	query: "",
	searching: !1
}, wt = "itadaki.list", Tt = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		narrow: { type: Boolean },
		admin: { type: Boolean },
		_recipes: { state: !0 },
		_drafts: { state: !0 },
		_query: { state: !0 },
		_tags: { state: !0 },
		_filter: { state: !0 },
		_group: { state: !0 },
		_searching: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O, o`
      .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
      .recipe { cursor: pointer; display: flex; flex-direction: column; gap: 8px; min-height: 96px; }
      .recipe:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
      .recipe .name { font-weight: 600; font-size: 1.05rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .search { max-width: 560px; }
      .chosen { margin-bottom: 8px; }
      .grid + .group { margin-top: 24px; }
      .inbox { margin-bottom: 24px; }
      .request { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .photo { padding: 0 0 16px; overflow: hidden; }
      .photo > :not(.picture) { padding: 0 16px; }
      .picture { position: relative; margin-bottom: 4px; }
      .picture img, .picture .placeholder { width: 100%; height: 150px; object-fit: cover; display: block; }
      .picture .placeholder { background: linear-gradient(135deg, var(--it-soft), transparent); }
      /* Time, translations and variant sit on the photo, leaving the line under the title to tags. */
      .badges { position: absolute; left: 8px; bottom: 8px; display: flex; gap: 4px; max-width: calc(100% - 16px); }
      .badges span { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 999px;
        font-size: 0.75rem; white-space: nowrap; color: #fff; background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(4px); }
      .badges svg { width: 14px; height: 14px; fill: currentColor; }
      .chip.ready { background: var(--it-accent); color: var(--it-on-accent); }
      .chip.failed { background: color-mix(in srgb, var(--it-error) 18%, transparent); }
      @media (max-width: 600px) {
        .grid { gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .recipe:not(.photo) { padding: 12px; }
        .photo { padding-bottom: 12px; }
        .photo > :not(.picture) { padding: 0 10px; }
        .picture img, .picture .placeholder { height: 110px; }
        .badges { left: 6px; bottom: 6px; }
        .recipe .name { font-size: 0.95rem; }
      }
    `];
	connectedCallback() {
		super.connectedCallback(), this._query = Ct.query;
		let e = _t(wt, {});
		this._filter = Array.isArray(e.tags) ? e.tags : [], this._group = yt.includes(e.group) ? e.group : "none", this._searching = Ct.searching, this._load(), this._loadTags(), this._loadDrafts(), this._unsubscribe = this.api.subscribeDrafts((e) => {
			this._loadDrafts(), e.status === "saved" && this._load();
		});
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._unsubscribe?.then((e) => e());
	}
	async _loadTags() {
		try {
			let [e, t] = await Promise.all([Ke(this.api, "recipe_tags"), Ke(this.api, "ingredient_tags")]);
			this._tags = [...e, ...t].sort(Xe(this.lang));
			let n = this._filter.filter((e) => this._tags.some((t) => t.id === e));
			n.length !== this._filter.length && this._setFilter(n);
		} catch (e) {
			this._error = this.t.error(e);
		}
	}
	_save() {
		vt(wt, {
			tags: this._filter,
			group: this._group
		});
	}
	_setFilter(e) {
		this._filter = e, this._save(), this._load();
	}
	_setGroup(e) {
		this._group = e, this._save();
	}
	_groupLabel = (e, t) => {
		let n = this.t;
		if (t === null) return n(e === "tag" ? "noTags" : "noTime");
		if (e === "tag") {
			let e = this._tags?.find((e) => e.id === t);
			return e && k(e, this.lang);
		}
		return e === "language" ? n.langName(t) : n(`time_${t}`);
	};
	async _load() {
		let e = this._filter;
		try {
			let t = await this.api.call("list_recipes", {
				prefer_language: this.lang,
				query: this._query || void 0,
				...e.length ? { tags: e } : {}
			});
			this._recipes = t.recipes, this._error = void 0;
		} catch (e) {
			this._error = this.t.error(e);
		}
	}
	async _loadDrafts() {
		try {
			this._drafts = (await this.api.call("list_drafts")).drafts;
		} catch (e) {
			this._error = this.t.error(e);
		}
	}
	_search(e) {
		this._query = Ct.query = e, clearTimeout(this._timer), this._timer = setTimeout(() => this._load(), 250);
	}
	async _setSearching(e) {
		if (this._searching = Ct.searching = e, e) {
			await this.updateComplete;
			let e = this.renderRoot.querySelector(".search");
			await e.updateComplete, e.focus();
		} else (this._query || this._filtered) && (this._query = Ct.query = "", this._setFilter([]));
	}
	get _filtered() {
		return this._filter.length > 0;
	}
	_tagBar(e) {
		let t = this.t;
		return T`<itadaki-tags slot=${e === "box" ? "title" : E} class=${e === "box" ? "search" : "chosen"}
      only=${e} freeText .entries=${this._tags || []}
      .value=${this._filter} .text=${this._query} lang=${this.lang} .hint=${(e) => ({
			name: k(e, this.lang),
			hint: e.kind === "ingredient" ? t("ingredientTag") : ""
		})} .t=${t}
      placeholder=${t("search")} @text=${(e) => this._search(e.detail.value)} @change=${(e) => this._setFilter(e.detail.value)}></itadaki-tags>`;
	}
	_picture(e) {
		let t = this.t, n = st(e);
		return T`<div class="picture">
      ${e.image_url ? T`<img src=${e.thumbnail_url || e.image_url} alt="" loading="lazy" referrerpolicy="no-referrer" />` : T`<div class="placeholder"></div>`}
      <div class="badges">
        ${n ? T`<span>${j("clock")}${t("minutes", { n })}</span>` : E}
        ${e.languages.length > 1 ? T`<span title=${e.languages.map((e) => t.langName(e)).join(", ")}>${j("translate")}</span>` : E}
        ${e.relation === "variant" ? T`<span>${t("variant")}</span>` : E}
      </div>
    </div>`;
	}
	_tagNames(e) {
		let t = new Map((this._tags || []).map((e) => [e.id, e]));
		return e.tags.filter((e) => t.has(e)).map((e) => k(t.get(e), this.lang));
	}
	_card(e) {
		return T`<div class="card recipe photo" @click=${() => this._open(e.id)}>
      ${this._picture(e)}
      <div class="name" title=${e.title}>${e.title}</div>
      <itadaki-fit-chips .labels=${this._tagNames(e)}></itadaki-fit-chips>
    </div>`;
	}
	_open(e) {
		A(this, {
			view: "recipe",
			id: e
		});
	}
	render() {
		let e = this.t;
		return T`<itadaki-page .t=${e} header=${e("recipes")} home ?narrow=${this.narrow}>
      ${this._searching ? T`${this._tagBar("box")}${it("close", e("closeSearch"), () => this._setSearching(!1))}` : it("search", e("search"), () => this._setSearching(!0))}
      <itadaki-menu slot="actions" icon="group" label=${e("groupBy")}
        .items=${yt.map((t) => ({
			label: e(`group_${t}`),
			active: t === this._group,
			run: () => this._setGroup(t)
		}))}></itadaki-menu>
      ${this.admin ? it("cog", e("manage"), () => A(this, { view: "manage" })) : E}
      ${this._filtered ? this._tagBar("chips") : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
      ${this._drafts?.length ? T`<h2>${e("drafts")}</h2>
            <div class="grid inbox">
              ${this._drafts.map((t) => T`
                  <div class="card recipe" @click=${() => A(this, {
			view: "draft",
			id: t.id
		})}>
                    <div class="name">${t.title}</div>
                    ${gt(e, t) ? T`<div class="muted request">${gt(e, t)}</div>` : E}
                    <div class="row">
                      <span class="chip">${e.action(t.action)}</span>
                      <span class="chip ${t.status}">${e.status(t.status)}</span>
                    </div>
                  </div>
                `)}
            </div>
            <h2>${e("recipes")}</h2>` : E}
      ${this._recipes?.length === 0 && !this._query && !this._filtered ? T`<p class="muted">${e("empty")}</p>` : E}
      ${this._recipes?.length === 0 && (this._filtered || this._query) ? T`<p class="muted">${e("noMatches")}</p>` : E}
      ${xt(this._recipes || [], this._group, this._groupLabel).map((e) => T`${e.label ? T`<h2 class="group">${e.label}</h2>` : E}
          <div class="grid">${e.recipes.map((e) => this._card(e))}</div>`)}
      <div class="fab-space"></div>
    </itadaki-page>
    ${at("plus", e("add"), () => A(this, { view: "add" }))}`;
	}
};
customElements.define("itadaki-list", Tt);
// src/views/ai-run.js
var Et = class extends D {
	static properties = {
		t: { attribute: !1 },
		heading: {},
		standing: {},
		noteRequired: { type: Boolean },
		variant: { type: Boolean },
		cancellable: { type: Boolean },
		disabled: { type: Boolean },
		_note: { state: !0 }
	};
	static styles = [O, o`
      :host { display: block; }
      .standing { white-space: pre-wrap; font-size: 0.9rem; }
      .foot { margin-top: 12px; justify-content: space-between; }
    `];
	updated(e) {
		if (!e.has("heading")) return;
		let t = this.renderRoot.querySelector("#note");
		t.value = this._note = "", this.scrollIntoView({
			block: "nearest",
			behavior: "smooth"
		}), this.noteRequired && t.focus({ preventScroll: !0 });
	}
	_run() {
		let e = this._note?.trim() ?? "", t = !!this.renderRoot.querySelector("#variant")?.checked;
		this.dispatchEvent(new CustomEvent("run", { detail: {
			note: e,
			asVariant: t
		} }));
	}
	render() {
		let e = this.t;
		return T`
      <div class="card">
        <h2>${this.heading}</h2>
        <slot></slot>
        <label>${e("standing")}</label>
        <div class="standing ${this.standing ? "" : "muted"}">${this.standing || e("standingNone")}</div>
        <label for="note">${this.noteRequired ? e("instruction") : e("note")}</label>
        <textarea id="note" rows="2" placeholder=${this.noteRequired ? e("adaptHint") : e("noteHint")}
          @input=${(e) => this._note = e.target.value}></textarea>
        <div class="row foot">
          ${this.variant ? T`<label class="row" style="margin:0"><input type="checkbox" id="variant" /> ${e("asVariant")}</label>` : T`<span></span>`}
          <div class="row">
            ${this.cancellable ? T`<button class="btn quiet" ?disabled=${this.disabled} @click=${() => this.dispatchEvent(new CustomEvent("cancel"))}>${e("cancel")}</button>` : E}
            <button class="btn" ?disabled=${this.disabled || this.noteRequired && !this._note?.trim()} @click=${this._run}>${e("run")}</button>
          </div>
        </div>
      </div>
    `;
	}
};
customElements.define("itadaki-ai-run", Et);
// src/views/amount.js
var Dt = class extends D {
	static properties = {
		value: { type: Number },
		text: {},
		unit: {},
		label: {},
		_editing: { state: !0 }
	};
	static styles = [O, o`
      :host { display: inline-flex; }
      button { font: inherit; color: inherit; font-weight: inherit; background: none; border: none; padding: 2px 6px;
        margin: -2px -6px; border-radius: 8px; cursor: pointer; text-decoration: underline dotted var(--it-muted);
        text-underline-offset: 4px; white-space: nowrap; }
      button:hover { background: var(--it-soft); }
      .edit { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
      input[type="number"] { width: 5.5em; padding: 4px 8px; font-weight: inherit; text-align: right; }
    `];
	updated(e) {
		if (e.has("_editing") && this._editing) {
			let e = this.renderRoot.querySelector("input");
			e.focus(), e.select();
		}
	}
	_commit(e) {
		if (!this._editing) return;
		this._editing = !1;
		let t = Number(e.value);
		e.value !== "" && t > 0 && t !== this.value && this.dispatchEvent(new CustomEvent("amount", { detail: { value: t } }));
	}
	_key(e) {
		e.key === "Enter" && this._commit(e.target), e.key === "Escape" && (this._editing = !1);
	}
	render() {
		return this._editing ? T`<span class="edit">
      <input type="number" inputmode="decimal" step="any" min="0" aria-label=${this.label}
        .value=${String(Math.round(this.value * 100) / 100)} @keydown=${this._key} @blur=${(e) => this._commit(e.target)} />
      ${this.unit}
    </span>` : T`<button title=${this.label} @click=${() => this._editing = !0}>${this.text}</button>`;
	}
};
customElements.define("itadaki-amount", Dt);
// src/views/busy.js
var Ot = class extends D {
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
customElements.define("itadaki-busy", Ot);
// src/views/shopping.js
var kt = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		recipeId: {},
		factor: { type: Number },
		subject: {},
		_items: { state: !0 },
		_lists: { state: !0 },
		_list: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O, o`
      :host { display: block; }
      .item { display: grid; grid-template-columns: auto minmax(0, 1fr) 5.5em; gap: 8px; align-items: center; padding: 8px 0; }
      .item + .item { border-top: var(--it-row-rule); }
      .item input[type="checkbox"] { width: 20px; height: 20px; margin: 0; }
      .item input[type="text"] { padding: 6px 10px; border-radius: 10px; }
      .item .amount { text-align: right; }
      .item:not(.on) input[type="text"] { opacity: 0.6; }
      .foot { margin-top: 12px; display: grid; gap: 8px; }
      .foot .row { justify-content: flex-end; }
    `];
	updated(e) {
		(e.has("recipeId") || e.has("factor")) && this._load();
	}
	async _load() {
		try {
			let [e, { items: t }] = await Promise.all([this._lists ? null : this.api.call("get_shopping_settings"), this.api.call("shopping_items", {
				recipe_id: this.recipeId,
				factor: this.factor
			})]);
			e && (this._lists = e.lists, this._list = e.list);
			let n = new Set((this._items ?? []).flatMap((e) => e.checked ? e.lines : []));
			this._items = t.map((e) => ({
				...e,
				checked: e.lines.some((e) => n.has(e))
			})), this._error = void 0;
		} catch (e) {
			this._error = this.t.error(e);
		}
	}
	_set(e, t) {
		this._items = this._items.map((n, r) => r === e ? {
			...n,
			...t
		} : n);
	}
	async _add() {
		let e = this._items.filter((e) => e.checked);
		this._busy = !0, this._error = void 0;
		try {
			let t = e.map(({ name: e, quantity: t }) => ({
				name: e,
				quantity: t
			})), { added: n } = await this.api.call("add_to_shopping_list", {
				list: this._list,
				items: t,
				description: this.subject
			}), r = this._lists.find((e) => e.entity_id === this._list)?.name ?? this._list;
			this.dispatchEvent(new CustomEvent("added", { detail: { message: this.t("addedN", {
				n,
				list: r
			}) } }));
		} catch (e) {
			this._error = this.t.error(e);
		} finally {
			this._busy = !1;
		}
	}
	render() {
		let e = this.t, t = this._items?.filter((e) => e.checked).length ?? 0;
		return T`
      ${this._items ? T`${this._items.map((t, n) => T`<div class="item ${t.checked ? "on" : ""}">
              <input type="checkbox" .checked=${t.checked} @change=${(e) => this._set(n, { checked: e.target.checked })} />
              <input type="text" aria-label=${e("name")} .value=${t.name}
                @input=${(e) => this._set(n, {
			name: e.target.value,
			checked: !0
		})} />
              <input type="text" class="amount" aria-label=${e("amount")} .value=${t.quantity}
                @input=${(e) => this._set(n, {
			quantity: e.target.value,
			checked: !0
		})} />
            </div>`)}` : this._error ? E : T`<itadaki-busy></itadaki-busy>`}
      ${this._lists && !this._lists.length ? T`<div class="error">${e("noTodoLists")}</div>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
      <div class="foot">
        ${this._lists?.length > 1 ? T`<select aria-label=${e("todoList")} @change=${(e) => this._list = e.target.value}>
              ${this._lists.map((e) => T`<option value=${e.entity_id} ?selected=${e.entity_id === this._list}>${e.name}</option>`)}
            </select>` : E}
        <div class="row">
          <button class="btn quiet" ?disabled=${this._busy} @click=${() => this.dispatchEvent(new CustomEvent("cancel"))}>${e("cancel")}</button>
          <button class="btn" ?disabled=${this._busy || !t || !this._list} @click=${this._add}>${e("addN", { n: t })}</button>
        </div>
      </div>`;
	}
};
customElements.define("itadaki-shopping", kt);
// src/views/body.js
function At(e, t) {
	let n = [];
	return e.forEach((e, r) => {
		let i = t(e, r) || "", a = n[n.length - 1];
		a && a.section === i ? a.items.push(e) : n.push({
			section: i,
			items: [e]
		});
	}), n;
}
var jt = class extends D {
	static properties = {
		recipe: { attribute: !1 },
		lines: { attribute: !1 },
		t: { attribute: !1 },
		cooking: {
			type: Boolean,
			reflect: !0
		},
		scalable: { type: Boolean }
	};
	static styles = [O, o`
      :host { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
      @media (max-width: 800px) { :host { grid-template-columns: minmax(0, 1fr); } }
      .item { display: flex; gap: 14px; padding: 12px 0; line-height: 1.5; }
      .item + .item { border-top: var(--it-row-rule); }
      .item:first-of-type { padding-top: 4px; }
      .ingredient { display: block; }
      .ingredient .line { display: flex; gap: 12px; justify-content: space-between; align-items: baseline; }
      .measure { text-align: right; white-space: nowrap; font-weight: 600; }
      .ingredient .note { font-size: 0.85em; color: var(--it-muted); }
      .num { flex-shrink: 0; width: 1.8em; height: 1.8em; border-radius: 50%; display: grid; place-items: center;
        background: var(--it-soft); font-weight: 600; font-size: 0.85em; }
      :host([cooking]) { font-size: 1.3rem; }
      :host([cooking]) h2 { font-size: 1.4rem; }
      :host([cooking]) .item { padding: 20px 0; line-height: 1.6; }
      h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--it-muted); margin: 16px 0 4px; }
      .notes { grid-column: 1 / -1; white-space: pre-wrap; }
      .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: -8px -8px 12px 0; min-height: 40px; }
      .card > .head { padding-bottom: 0; }
      .head h2 { margin: 0; }
    `];
	_measure(e) {
		let t = this.recipe.ingredients[e.index]?.quantity;
		return !this.scalable || t == null ? e.measure : T`<itadaki-amount .value=${t} text=${e.measure} unit=${e.unit}
      label=${this.t("amountFor", { name: e.name })} @amount=${(e) => this.dispatchEvent(new CustomEvent("scale", {
			detail: { ratio: e.detail.value / t },
			bubbles: !0,
			composed: !0
		}))}></itadaki-amount>`;
	}
	render() {
		let { recipe: e, lines: t, t: n } = this, r = At(t.map((e, t) => ({
			...e,
			index: t
		})), (t) => e.ingredients[t.index]?.section), i = At(e.steps.map((e, t) => ({
			...e,
			number: t + 1
		})), (e) => e.section);
		return T`
      <div class="card">
        <div class="head"><h2>${n("ingredients")}</h2><slot name="ingredients-action"></slot></div>
        <slot name="ingredients-note"></slot>
        <slot name="ingredients">${r.map((e) => T`${e.section ? T`<h3>${e.section}</h3>` : E}
            ${e.items.map((e) => T`<div class="item ingredient">
                <div class="line"><span>${e.name}</span><span class="measure">${this._measure(e)}</span></div>
                ${e.note ? T`<div class="note">${e.note}</div>` : E}
              </div>`)}`)}</slot>
      </div>
      <div class="card">
        <h2>${n("steps")}</h2>
        ${i.map((e) => T`${e.section ? T`<h3>${e.section}</h3>` : E}
            ${e.items.map((e) => T`<div class="item"><span class="num">${e.number}</span><span>${e.text}</span></div>`)}`)}
      </div>
      ${e.notes && !this.cooking ? T`<div class="card notes"><h2>${n("notes")}</h2>${e.notes}</div>` : E}
    `;
	}
};
customElements.define("itadaki-body", jt);
// src/scale.js
var Mt = (e) => `itadaki.scale.${e}`, Nt = (e) => {
	let t = Math.round(e * 1e4) / 1e4;
	return Math.abs(t - 1) < .001 ? 1 : t;
};
function Pt(e) {
	let t = Number(_t(Mt(e), 1));
	return t > 0 ? t : 1;
}
function Ft(e, t) {
	vt(Mt(e), t === 1 ? void 0 : t);
}
// src/views/recipe.js
var It = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		languages: { attribute: !1 },
		ai: { type: Boolean },
		instructions: { attribute: !1 },
		recipeId: {},
		_data: { state: !0 },
		_factor: { state: !0 },
		_shopping: { state: !0 },
		_notice: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 },
		_tags: { state: !0 },
		_task: { state: !0 },
		_drafts: { state: !0 },
		_cooking: { state: !0 }
	};
	static styles = [O, o`
      .hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 16px; }
      .hero img { width: 180px; height: 135px; object-fit: cover; border-radius: var(--it-radius); flex-shrink: 0; }
      @media (max-width: 600px) { .hero { flex-direction: column; } .hero img { width: 100%; height: 200px; } }
      h1 { margin: 0 0 8px; font-size: 1.6rem; }
      .meta { margin: 8px 0; }
      .cart { padding: 8px; }
      .cart.on { background: var(--it-accent); color: var(--it-on-accent); }
      .scale svg { width: 14px; height: 14px; fill: currentColor; }
      .adapt { margin-bottom: 16px; }
      .variants { margin-top: 16px; }
      .drafts { margin-bottom: 16px; }
      .draft { display: flex; gap: 10px; align-items: center; width: 100%; text-align: left; font: inherit;
        color: inherit; background: none; border: none; padding: 8px 0; cursor: pointer; }
      .draft:hover { color: var(--it-accent); }
      .chip.tag { background: none; border: 1px solid var(--it-divider); }
      .chip.ready { background: var(--it-accent); color: var(--it-on-accent); }
      .chip.failed { background: color-mix(in srgb, var(--it-error) 18%, transparent); }
      a { color: var(--it-accent); }
      .cooking { position: fixed; inset: 0; z-index: 10; overflow-y: auto;
        background: var(--primary-background-color, #f2f2f7); }
      .cooking header { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; gap: 8px;
        padding: 4px 4px 4px 20px; background: var(--primary-background-color, #f2f2f7); }
      .cooking h1 { flex: 1; min-width: 0; margin: 0; font-size: 1.5rem; }
      .cooking .body { max-width: 1100px; margin: 0 auto; padding: 8px 16px 32px; }
    `];
	connectedCallback() {
		super.connectedCallback(), this._unsubscribe = this.api.subscribeDrafts(() => this._loadDrafts());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._unsubscribe?.then((e) => e()), this._keepAwake(!1);
	}
	_keepAwake(e) {
		document.removeEventListener("visibilitychange", this._onVisible), this._wakeLock?.then((e) => e?.release()), this._wakeLock = void 0, e && navigator.wakeLock && (this._onVisible ??= () => document.visibilityState === "visible" && this._keepAwake(!0), document.addEventListener("visibilitychange", this._onVisible), this._wakeLock = navigator.wakeLock.request("screen").catch(() => void 0));
	}
	updated(e) {
		e.has("_cooking") && this._keepAwake(!!this._cooking), e.has("recipeId") && (this._factor = Pt(this.recipeId), this._shopping = !1, this._notice = void 0, this._task = void 0, this._cooking = !1, this._load(), this._loadDrafts());
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
			let [e, t] = await Promise.all([this.api.call("get_recipe", {
				recipe_id: this.recipeId,
				factor: this._factor
			}), this._tags ?? Ke(this.api, "recipe_tags")]);
			this._data = e, this._tags = t, this._error = void 0;
		} catch (e) {
			this._error = this.t.error(e);
		}
	}
	_scale(e) {
		this._setFactor(Nt(this._factor * e));
	}
	_setFactor(e) {
		this._factor = e, Ft(this.recipeId, e), this._load();
	}
	_scaleChip() {
		if (this._factor === 1) return E;
		let e = this.t("resetScale");
		return T`<button class="chip active scale" title=${e} aria-label=${e} @click=${() => this._setFactor(1)}>
      ${this.t("scaled", { n: Math.round(this._factor * 100) / 100 })} ${j("close")}</button>`;
	}
	_yield() {
		let e = this.t, { recipe: t, yield: n } = this._data, r = t.yield_quantity;
		if (!r) return E;
		let i = Math.round(r * 100) / 100, a = (e) => this._scale(e / r);
		return T`<itadaki-amount .value=${r} text=${n ? e("makes", { measure: n.measure }) : e("serves", { n: i })}
      unit=${n ? n.unit : e("people")} label=${e("yield")} @amount=${(e) => a(e.detail.value)}></itadaki-amount>`;
	}
	async _ai(e, t) {
		this._busy = !0, this._error = void 0;
		try {
			let { draft_id: n } = await this.api.call(e, t);
			A(this, {
				view: "draft",
				id: n
			});
		} catch (e) {
			this._error = this.t.error(e);
		} finally {
			this._busy = !1;
		}
	}
	async _keepTranslation() {
		try {
			await this.api.call("mark_translation_synced", { recipe_id: this.recipeId }), await this._load();
		} catch (e) {
			this._error = this.t.error(e);
		}
	}
	async _delete() {
		if (confirm(this.t("confirmDelete"))) {
			try {
				await this.api.call("delete_recipe", { recipe_id: this.recipeId });
			} catch (e) {
				if (e.key !== "in_use") {
					this._error = this.t.error(e);
					return;
				}
				if (!confirm(this.t("confirmDeleteAll"))) return;
				try {
					await this.api.call("delete_recipe", {
						recipe_id: this.recipeId,
						cascade: !0
					});
				} catch (e) {
					this._error = this.t.error(e);
					return;
				}
			}
			A(this, {
				view: "list",
				replace: !0
			});
		}
	}
	render() {
		return this._cooking ? this._cookingMode() : T`<itadaki-page .t=${this.t}>${this._data ? this._actions() : E}${this._content()}</itadaki-page>
      ${this._data ? at("cook", this.t("cook"), () => this._cooking = !0) : E}`;
	}
	_cookingMode() {
		let { recipe: e, lines: t } = this._data;
		return T`<div class="cooking">
      <header>
        <h1>${e.title}</h1>
        ${this._scaleChip()}
        <button class="icon" aria-label=${this.t("closeCooking")} title=${this.t("closeCooking")}
          @click=${() => this._cooking = !1}>${j("close")}</button>
      </header>
      <div class="body"><itadaki-body cooking scalable .recipe=${e} .lines=${t} .t=${this.t}
        @scale=${(e) => this._scale(e.detail.ratio)}></itadaki-body></div>
    </div>`;
	}
	_actions() {
		let e = this.t, { recipe: t, translations: n } = this._data, r = [{
			id: t.id,
			language: t.language
		}, ...n].sort((e, t) => e.language.localeCompare(t.language)), i = this.ai ? this.languages.filter((e) => !r.some((t) => t.language === e)) : [], a = [
			...r.map((n) => ({
				label: e.langName(n.language),
				active: n.id === t.id,
				run: () => n.id !== t.id && (Ft(n.id, this._factor), A(this, {
					view: "recipe",
					id: n.id,
					replace: !0
				}))
			})),
			...i.length ? ["-"] : [],
			...i.map((n) => ({
				label: e("translateTo", { lang: e.langName(n) }),
				run: () => this._task = {
					action: "translate",
					recipeId: t.id,
					language: n
				}
			}))
		], o = (e, t, n) => it(e, t, n, this._busy);
		return T`
      ${a.length > 1 ? T`<itadaki-menu slot="actions" icon="translate" label=${e("language")} .items=${a} ?disabled=${this._busy}></itadaki-menu>` : E}
      ${o("edit", e("edit"), () => A(this, {
			view: "edit",
			id: t.id
		}))}
      ${this.ai ? o("tag", e("tagAi"), () => this._toggleTask("tag")) : E}
      ${this.ai ? o("adapt", e("adapt"), () => this._toggleTask("adapt")) : E}
      ${o("delete", e("delete"), this._delete)}
    `;
	}
	_toggleTask(e) {
		this._task = this._task?.action === e ? void 0 : { action: e };
	}
	_taskCard() {
		let e = this.t, t = this._task, n = t.action === "adapt";
		return T`<itadaki-ai-run class="adapt" .t=${e} cancellable ?variant=${n} ?noteRequired=${n}
      heading=${t.action === "translate" ? e("translateTo", { lang: e.langName(t.language) }) : e(`${t.action}Ai`)} .standing=${this.instructions[t.action]} ?disabled=${this._busy}
      @run=${(e) => {
			let { note: r, asVariant: i } = e.detail, a = r ? { note: r } : {};
			if (n) return this._ai("adapt", {
				recipe_id: this.recipeId,
				instruction: r,
				as_variant: i
			});
			if (t.action === "tag") return this._ai("suggest_tags", {
				recipe_id: this.recipeId,
				...a
			});
			this._ai("translate", {
				recipe_id: t.recipeId,
				language: t.language,
				...a
			});
		}} @cancel=${() => this._task = void 0}>
      ${t.again ? T`<div class="muted">${e("retranslateNote")}</div>` : E}
      ${t.action === "tag" ? T`<div class="muted">${e("tagAiExplain")}</div>` : E}
    </itadaki-ai-run>`;
	}
	_content() {
		let e = this.t;
		if (!this._data) return this._error ? T`<div class="error">${this._error}</div>` : T`<itadaki-busy></itadaki-busy>`;
		let { recipe: t, lines: n, variants: r, stale: i, parent: a } = this._data, o = st(t);
		return T`
      <div class="hero">
        ${t.image_url ? T`<img src=${t.image_url} alt="" referrerpolicy="no-referrer" />` : E}
        <div>
          <h1>${t.title}</h1>
          ${t.description ? T`<div class="muted">${t.description}</div>` : E}
          <div class="row meta">
            <span class="chip">${e.langName(t.language)}</span>
            ${t.relation === "variant" && a ? T`<button class="chip" @click=${() => A(this, {
			view: "recipe",
			id: a.id
		})}>
                  ${e("variant")}: ${a.title}</button>` : E}
            ${o ? T`<span class="chip">${e("minutes", { n: o })}</span>` : E}
            ${this._yield()}
            ${this._scaleChip()}
          </div>
          ${t.tags.length ? T`<div class="row meta">${t.tags.map((e) => {
			let n = this._tags.find((t) => t.id === e);
			return T`<span class="chip tag">${n ? k(n, t.language) : e}</span>`;
		})}</div>` : E}
          ${t.source_url ? T`<div class="muted"><a href=${t.source_url} target="_blank" rel="noreferrer">${e("source")}</a></div>` : E}
        </div>
      </div>

      ${i ? T`<div class="banner row">${e("stale")}
            ${this.ai ? T`<button class="btn quiet" ?disabled=${this._busy}
                  @click=${() => this._task = {
			action: "translate",
			recipeId: a.id,
			language: t.language,
			again: !0
		}}>${e("retranslate")}</button>` : E}
            <button class="btn quiet" ?disabled=${this._busy} title=${e("keepTranslationHint")} @click=${this._keepTranslation}>${e("keepTranslation")}</button>
          </div>` : E}

      ${this._task ? this._taskCard() : E}
      ${this._drafts?.length ? T`<div class="card drafts">
            <h2>${e("inProgress")}</h2>
            ${this._drafts.map((t) => T`<button class="draft" @click=${() => A(this, {
			view: "draft",
			id: t.id
		})}>
                <span class="chip ${t.status}">${e.status(t.status)}</span>
                <span>${e.action(t.action)}${gt(e, t) ? ` · ${gt(e, t)}` : ""}</span>
              </button>`)}
          </div>` : E}
      ${this._busy ? T`<itadaki-busy .text=${e("working")}></itadaki-busy>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}

      <itadaki-body scalable .recipe=${t} .lines=${n} .t=${e} @scale=${(e) => this._scale(e.detail.ratio)}>
        <button slot="ingredients-action" class="icon cart ${this._shopping ? "on" : ""}" aria-label=${e("toShoppingList")}
          title=${e("toShoppingList")} aria-pressed=${this._shopping ? "true" : "false"}
          @click=${() => (this._shopping = !this._shopping, this._notice = void 0)}>${j("cart")}</button>
        ${this._notice ? T`<div slot="ingredients-note" class="muted">${this._notice}</div>` : E}
        ${this._shopping ? T`<itadaki-shopping slot="ingredients" .api=${this.api} .t=${e} recipeId=${t.id} .factor=${this._factor}
              subject=${t.title} @cancel=${() => this._shopping = !1}
              @added=${(e) => (this._shopping = !1, this._notice = e.detail.message)}></itadaki-shopping>` : E}
      </itadaki-body>

      ${r.length ? T`<div class="card variants">
            <h2>${e("variants")}</h2>
            <div class="row">${r.map((e) => T`<button class="chip" @click=${() => A(this, {
			view: "recipe",
			id: e.id
		})}>${e.title}</button>`)}</div>
          </div>` : E}
      <div class="fab-space"></div>
    `;
	}
};
customElements.define("itadaki-recipe", It);
// src/views/import.js
var Lt = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		ai: { type: Boolean },
		instructions: { attribute: !1 },
		_noData: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 }
	};
	static styles = [O, o`.card + .card, .card + itadaki-ai-run { margin-top: 16px; }`];
	get _url() {
		return this.renderRoot.querySelector("#url").value.trim();
	}
	async _import(e) {
		e.preventDefault(), this._url && (this._noData = !1, await this._open("import_url", { url: this._url }));
	}
	async _open(e, t) {
		this._busy = !0, this._error = void 0;
		try {
			let { draft_id: n } = await this.api.call(e, t);
			A(this, {
				view: "draft",
				id: n
			});
		} catch (e) {
			e.key === "no_recipe_data" ? this._noData = !0 : this._error = this.t.error(e);
		} finally {
			this._busy = !1;
		}
	}
	render() {
		let e = this.t;
		return T`<itadaki-page .t=${e} header=${e("addRecipe")}>
      <form class="card" @submit=${this._import}>
        <h2>${e("importTitle")}</h2>
        <label for="url">${e("url")}</label>
        <itadaki-text id="url" type="url" placeholder="https://" @input=${() => this._noData = !1}></itadaki-text>
        ${this.ai ? E : T`<div class="muted" style="margin-top:12px">${e("importNoAi")}</div>`}
        <div class="row" style="margin-top:16px">
          <button class="btn" type="submit" ?disabled=${this._busy}>${e("import")}</button>
        </div>
        ${this._noData && !this.ai ? T`<div class="error">${e("noRecipeDataNoAi")}</div>` : E}
        ${this._busy ? T`<itadaki-busy></itadaki-busy>` : E}
        ${this._error ? T`<div class="error">${this._error}</div>` : E}
      </form>
      ${this._noData && this.ai ? T`<itadaki-ai-run .t=${e} heading=${e("importAi")} .standing=${this.instructions.extract}
            ?disabled=${this._busy} @run=${(e) => this._open("extract_url", {
			url: this._url,
			...e.detail.note ? { note: e.detail.note } : {}
		})}>
            <div class="muted">${e("noRecipeData")}</div>
          </itadaki-ai-run>` : E}
      <div class="card">
        <h2>${e("writeTitle")}</h2>
        <div class="muted">${e("writeHint")}</div>
        <div class="row" style="margin-top:16px">
          <button class="btn quiet" @click=${() => A(this, {
			view: "new",
			replace: !0
		})}>${e("writeRecipe")}</button>
        </div>
      </div>
    </itadaki-page>`;
	}
};
customElements.define("itadaki-import", Lt);
// node_modules/lit-html/directive.js
var Rt = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, zt = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Bt = class {
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
}, { I: Vt } = Ie, Ht = (e) => e, Ut = () => document.createComment(""), Wt = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new Vt(r.insertBefore(Ut(), i), r.insertBefore(Ut(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Ht(e).nextSibling;
				Ht(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, Gt = (e, t, n = e) => (e._$AI(t, n), e), Kt = {}, qt = (e, t = Kt) => e._$AH = t, Jt = (e) => e._$AH, Yt = (e) => {
	e._$AR(), e._$AA.remove();
}, Xt = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, Zt = zt(class extends Bt {
	constructor(e) {
		if (super(e), e.type !== Rt.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = Jt(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = Gt(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = Gt(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = Gt(i[d], a[m]), Wt(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = Gt(i[f], a[p]), Wt(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = Xt(o, p, m), u = Xt(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = Wt(e, i[d]);
					Gt(t, a[p]), c[p] = t;
				} else c[p] = Gt(n, a[p]), Wt(e, i[d], n), i[t] = null;
				p++;
			} else Yt(i[f]), f--;
		} else Yt(i[d]), d++;
		for (; p <= m;) {
			let t = Wt(e, c[m + 1]);
			Gt(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && Yt(e);
		}
		return this.ut = o, qt(e, c), Se;
	}
});
// node_modules/sortablejs/modular/sortable.esm.js
function Qt(e, t, n) {
	return (t = an(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function $t() {
	return $t = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, $t.apply(null, arguments);
}
function en(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function M(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? en(Object(n), !0).forEach(function(t) {
			Qt(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : en(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function tn(e, t) {
	if (e == null) return {};
	var n, r, i = nn(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function nn(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function rn(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function an(e) {
	var t = rn(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function on(e) {
	"@babel/helpers - typeof";
	return on = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, on(e);
}
var sn = "1.15.7";
function cn(e) {
	if (typeof window < "u" && window.navigator) return !!/*@__PURE__*/ navigator.userAgent.match(e);
}
var ln = cn(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i), un = cn(/Edge/i), dn = cn(/firefox/i), fn = cn(/safari/i) && !cn(/chrome/i) && !cn(/android/i), pn = cn(/iP(ad|od|hone)/i), mn = cn(/chrome/i) && cn(/android/i), hn = {
	capture: !1,
	passive: !1
};
function N(e, t, n) {
	e.addEventListener(t, n, !ln && hn);
}
function P(e, t, n) {
	e.removeEventListener(t, n, !ln && hn);
}
function gn(e, t) {
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
function _n(e) {
	return e.host && e !== document && e.host.nodeType && e.host !== e ? e.host : e.parentNode;
}
function F(e, t, n, r) {
	if (e) {
		n ||= document;
		do {
			if (t != null && (t[0] === ">" ? e.parentNode === n && gn(e, t) : gn(e, t)) || r && e === n) return e;
			if (e === n) break;
		} while (e = _n(e));
	}
	return null;
}
var vn = /\s+/g;
function I(e, t, n) {
	e && t && (e.classList ? e.classList[n ? "add" : "remove"](t) : e.className = ((" " + e.className + " ").replace(vn, " ").replace(" " + t + " ", " ") + (n ? " " + t : "")).replace(vn, " "));
}
function L(e, t, n) {
	var r = e && e.style;
	if (r) {
		if (n === void 0) return document.defaultView && document.defaultView.getComputedStyle ? n = document.defaultView.getComputedStyle(e, "") : e.currentStyle && (n = e.currentStyle), t === void 0 ? n : n[t];
		!(t in r) && t.indexOf("webkit") === -1 && (t = "-webkit-" + t), r[t] = n + (typeof n == "string" ? "" : "px");
	}
}
function yn(e, t) {
	var n = "";
	if (typeof e == "string") n = e;
	else do {
		var r = L(e, "transform");
		r && r !== "none" && (n = r + " " + n);
	} while (!t && (e = e.parentNode));
	var i = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
	return i && new i(n);
}
function bn(e, t, n) {
	if (e) {
		var r = e.getElementsByTagName(t), i = 0, a = r.length;
		if (n) for (; i < a; i++) n(r[i], i);
		return r;
	}
	return [];
}
function xn() {
	return document.scrollingElement || document.documentElement;
}
function R(e, t, n, r, i) {
	if (e.getBoundingClientRect || e === window) {
		var a, o, s, c, l, u, d;
		if (e !== window && e.parentNode && e !== xn() ? (a = e.getBoundingClientRect(), o = a.top, s = a.left, c = a.bottom, l = a.right, u = a.height, d = a.width) : (o = 0, s = 0, c = window.innerHeight, l = window.innerWidth, u = window.innerHeight, d = window.innerWidth), (t || n) && e !== window && (i ||= e.parentNode, !ln)) do
			if (i && i.getBoundingClientRect && (L(i, "transform") !== "none" || n && L(i, "position") !== "static")) {
				var f = i.getBoundingClientRect();
				o -= f.top + parseInt(L(i, "border-top-width")), s -= f.left + parseInt(L(i, "border-left-width")), c = o + a.height, l = s + a.width;
				break;
			}
		while (i = i.parentNode);
		if (r && e !== window) {
			var p = yn(i || e), m = p && p.a, h = p && p.d;
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
function Sn(e, t, n) {
	for (var r = Dn(e, !0), i = R(e)[t]; r;) {
		var a = R(r)[n], o = void 0;
		if (o = n === "top" || n === "left" ? i >= a : i <= a, !o) return r;
		if (r === xn()) break;
		r = Dn(r, !1);
	}
	return !1;
}
function Cn(e, t, n, r) {
	for (var i = 0, a = 0, o = e.children; a < o.length;) {
		if (o[a].style.display !== "none" && o[a] !== Q.ghost && (r || o[a] !== Q.dragged) && F(o[a], n.draggable, e, !1)) {
			if (i === t) return o[a];
			i++;
		}
		a++;
	}
	return null;
}
function wn(e, t) {
	for (var n = e.lastElementChild; n && (n === Q.ghost || L(n, "display") === "none" || t && !gn(n, t));) n = n.previousElementSibling;
	return n || null;
}
function z(e, t) {
	var n = 0;
	if (!e || !e.parentNode) return -1;
	for (; e = e.previousElementSibling;) e.nodeName.toUpperCase() !== "TEMPLATE" && e !== Q.clone && (!t || gn(e, t)) && n++;
	return n;
}
function Tn(e) {
	var t = 0, n = 0, r = xn();
	if (e) do {
		var i = yn(e), a = i.a, o = i.d;
		t += e.scrollLeft * a, n += e.scrollTop * o;
	} while (e !== r && (e = e.parentNode));
	return [t, n];
}
function En(e, t) {
	for (var n in e) if (e.hasOwnProperty(n)) {
		for (var r in t) if (t.hasOwnProperty(r) && t[r] === e[n][r]) return Number(n);
	}
	return -1;
}
function Dn(e, t) {
	if (!e || !e.getBoundingClientRect) return xn();
	var n = e, r = !1;
	do
		if (n.clientWidth < n.scrollWidth || n.clientHeight < n.scrollHeight) {
			var i = L(n);
			if (n.clientWidth < n.scrollWidth && (i.overflowX == "auto" || i.overflowX == "scroll") || n.clientHeight < n.scrollHeight && (i.overflowY == "auto" || i.overflowY == "scroll")) {
				if (!n.getBoundingClientRect || n === document.body) return xn();
				if (r || t) return n;
				r = !0;
			}
		}
	while (n = n.parentNode);
	return xn();
}
function On(e, t) {
	if (e && t) for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
	return e;
}
function kn(e, t) {
	return Math.round(e.top) === Math.round(t.top) && Math.round(e.left) === Math.round(t.left) && Math.round(e.height) === Math.round(t.height) && Math.round(e.width) === Math.round(t.width);
}
var An;
function jn(e, t) {
	return function() {
		if (!An) {
			var n = arguments, r = this;
			n.length === 1 ? e.call(r, n[0]) : e.apply(r, n), An = setTimeout(function() {
				An = void 0;
			}, t);
		}
	};
}
function Mn() {
	clearTimeout(An), An = void 0;
}
function Nn(e, t, n) {
	e.scrollLeft += t, e.scrollTop += n;
}
function Pn(e) {
	var t = window.Polymer, n = window.jQuery || window.Zepto;
	return t && t.dom ? t.dom(e).cloneNode(!0) : n ? n(e).clone(!0)[0] : e.cloneNode(!0);
}
function Fn(e, t, n) {
	var r = {};
	return Array.from(e.children).forEach(function(i) {
		if (F(i, t.draggable, e, !1) && !i.animated && i !== n) {
			var a = R(i);
			r.left = Math.min(r.left ?? Infinity, a.left), r.top = Math.min(r.top ?? Infinity, a.top), r.right = Math.max(r.right ?? -Infinity, a.right), r.bottom = Math.max(r.bottom ?? -Infinity, a.bottom);
		}
	}), r.width = r.right - r.left, r.height = r.bottom - r.top, r.x = r.left, r.y = r.top, r;
}
var B = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
function In() {
	var e = [], t;
	return {
		captureAnimationState: function() {
			e = [], this.options.animation && [].slice.call(this.el.children).forEach(function(t) {
				if (L(t, "display") !== "none" && t !== Q.ghost) {
					e.push({
						target: t,
						rect: R(t)
					});
					var n = M({}, e[e.length - 1].rect);
					if (t.thisAnimationDuration) {
						var r = yn(t, !0);
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
			e.splice(En(e, { target: t }), 1);
		},
		animateAll: function(n) {
			var r = this;
			if (!this.options.animation) clearTimeout(t), typeof n == "function" && n();
			else {
				var i = !1, a = 0;
				e.forEach(function(e) {
					var t = 0, n = e.target, o = n.fromRect, s = R(n), c = n.prevFromRect, l = n.prevToRect, u = e.rect, d = yn(n, !0);
					d && (s.top -= d.f, s.left -= d.e), n.toRect = s, n.thisAnimationDuration && kn(c, s) && !kn(o, s) && (u.top - s.top) / (u.left - s.left) === (o.top - s.top) / (o.left - s.left) && (t = Rn(u, c, l, r.options)), kn(s, o) || (n.prevFromRect = o, n.prevToRect = s, t ||= r.options.animation, r.animate(n, u, s, t)), t && (i = !0, a = Math.max(a, t), clearTimeout(n.animationResetTimer), n.animationResetTimer = setTimeout(function() {
						n.animationTime = 0, n.prevFromRect = null, n.fromRect = null, n.prevToRect = null, n.thisAnimationDuration = null;
					}, t), n.thisAnimationDuration = t);
				}), clearTimeout(t), i ? t = setTimeout(function() {
					typeof n == "function" && n();
				}, a) : typeof n == "function" && n(), e = [];
			}
		},
		animate: function(e, t, n, r) {
			if (r) {
				L(e, "transition", ""), L(e, "transform", "");
				var i = yn(this.el), a = i && i.a, o = i && i.d, s = (t.left - n.left) / (a || 1), c = (t.top - n.top) / (o || 1);
				e.animatingX = !!s, e.animatingY = !!c, L(e, "transform", "translate3d(" + s + "px," + c + "px,0)"), this.forRepaintDummy = Ln(e), L(e, "transition", "transform " + r + "ms" + (this.options.easing ? " " + this.options.easing : "")), L(e, "transform", "translate3d(0,0,0)"), typeof e.animated == "number" && clearTimeout(e.animated), e.animated = setTimeout(function() {
					L(e, "transition", ""), L(e, "transform", ""), e.animated = !1, e.animatingX = !1, e.animatingY = !1;
				}, r);
			}
		}
	};
}
function Ln(e) {
	return e.offsetWidth;
}
function Rn(e, t, n, r) {
	return Math.sqrt((t.top - e.top) ** 2 + (t.left - e.left) ** 2) / Math.sqrt((t.top - n.top) ** 2 + (t.left - n.left) ** 2) * r.animation;
}
var zn = [], Bn = { initializeByDefault: !0 }, Vn = {
	mount: function(e) {
		for (var t in Bn) Bn.hasOwnProperty(t) && !(t in e) && (e[t] = Bn[t]);
		zn.forEach(function(t) {
			if (t.pluginName === e.pluginName) throw `Sortable: Cannot mount plugin ${e.pluginName} more than once`;
		}), zn.push(e);
	},
	pluginEvent: function(e, t, n) {
		var r = this;
		this.eventCanceled = !1, n.cancel = function() {
			r.eventCanceled = !0;
		};
		var i = e + "Global";
		zn.forEach(function(r) {
			t[r.pluginName] && (t[r.pluginName][i] && t[r.pluginName][i](M({ sortable: t }, n)), t.options[r.pluginName] && t[r.pluginName][e] && t[r.pluginName][e](M({ sortable: t }, n)));
		});
	},
	initializePlugins: function(e, t, n, r) {
		for (var i in zn.forEach(function(r) {
			var i = r.pluginName;
			if (e.options[i] || r.initializeByDefault) {
				var a = new r(e, t, e.options);
				a.sortable = e, a.options = e.options, e[i] = a, $t(n, a.defaults);
			}
		}), e.options) if (e.options.hasOwnProperty(i)) {
			var a = this.modifyOption(e, i, e.options[i]);
			a !== void 0 && (e.options[i] = a);
		}
	},
	getEventProperties: function(e, t) {
		var n = {};
		return zn.forEach(function(r) {
			typeof r.eventProperties == "function" && $t(n, r.eventProperties.call(t[r.pluginName], e));
		}), n;
	},
	modifyOption: function(e, t, n) {
		var r;
		return zn.forEach(function(i) {
			e[i.pluginName] && i.optionListeners && typeof i.optionListeners[t] == "function" && (r = i.optionListeners[t].call(e[i.pluginName], n));
		}), r;
	}
};
function Hn(e) {
	var t = e.sortable, n = e.rootEl, r = e.name, i = e.targetEl, a = e.cloneEl, o = e.toEl, s = e.fromEl, c = e.oldIndex, l = e.newIndex, u = e.oldDraggableIndex, d = e.newDraggableIndex, f = e.originalEvent, p = e.putSortable, m = e.extraEventProperties;
	if (t ||= n && n[B], t) {
		var h, ee = t.options, g = "on" + r.charAt(0).toUpperCase() + r.substr(1);
		window.CustomEvent && !ln && !un ? h = new CustomEvent(r, {
			bubbles: !0,
			cancelable: !0
		}) : (h = document.createEvent("Event"), h.initEvent(r, !0, !0)), h.to = o || n, h.from = s || n, h.item = i || n, h.clone = a, h.oldIndex = c, h.newIndex = l, h.oldDraggableIndex = u, h.newDraggableIndex = d, h.originalEvent = f, h.pullMode = p ? p.lastPutMode : void 0;
		var te = M(M({}, m), Vn.getEventProperties(r, t));
		for (var _ in te) h[_] = te[_];
		n && n.dispatchEvent(h), ee[g] && ee[g].call(t, h);
	}
}
var Un = ["evt"], V = function(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, r = n.evt, i = tn(n, Un);
	Vn.pluginEvent.bind(Q)(e, t, M({
		dragEl: U,
		parentEl: W,
		ghostEl: G,
		rootEl: K,
		nextEl: Wn,
		lastDownEl: Gn,
		cloneEl: q,
		cloneHidden: Kn,
		dragStarted: ar,
		putSortable: Y,
		activeSortable: Q.active,
		originalEvent: r,
		oldIndex: qn,
		oldDraggableIndex: Jn,
		newIndex: J,
		newDraggableIndex: Yn,
		hideGhostForTarget: Cr,
		unhideGhostForTarget: wr,
		cloneNowHidden: function() {
			Kn = !0;
		},
		cloneNowShown: function() {
			Kn = !1;
		},
		dispatchSortableEvent: function(e) {
			H({
				sortable: t,
				name: e,
				originalEvent: r
			});
		}
	}, i));
};
function H(e) {
	Hn(M({
		putSortable: Y,
		cloneEl: q,
		targetEl: U,
		rootEl: K,
		oldIndex: qn,
		oldDraggableIndex: Jn,
		newIndex: J,
		newDraggableIndex: Yn
	}, e));
}
var U, W, G, K, Wn, Gn, q, Kn, qn, J, Jn, Yn, Xn, Y, Zn = !1, Qn = !1, $n = [], er, X, tr, nr, rr, ir, ar, or, sr, cr = !1, lr = !1, ur, Z, dr = [], fr = !1, pr = [], mr = typeof document < "u", hr = pn, gr = un || ln ? "cssFloat" : "float", _r = mr && !mn && !pn && "draggable" in document.createElement("div"), vr = function() {
	if (mr) {
		if (ln) return !1;
		var e = document.createElement("x");
		return e.style.cssText = "pointer-events:auto", e.style.pointerEvents === "auto";
	}
}(), yr = function(e, t) {
	var n = L(e), r = parseInt(n.width) - parseInt(n.paddingLeft) - parseInt(n.paddingRight) - parseInt(n.borderLeftWidth) - parseInt(n.borderRightWidth), i = Cn(e, 0, t), a = Cn(e, 1, t), o = i && L(i), s = a && L(a), c = o && parseInt(o.marginLeft) + parseInt(o.marginRight) + R(i).width, l = s && parseInt(s.marginLeft) + parseInt(s.marginRight) + R(a).width;
	if (n.display === "flex") return n.flexDirection === "column" || n.flexDirection === "column-reverse" ? "vertical" : "horizontal";
	if (n.display === "grid") return n.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
	if (i && o.float && o.float !== "none") {
		var u = o.float === "left" ? "left" : "right";
		return a && (s.clear === "both" || s.clear === u) ? "vertical" : "horizontal";
	}
	return i && (o.display === "block" || o.display === "flex" || o.display === "table" || o.display === "grid" || c >= r && n[gr] === "none" || a && n[gr] === "none" && c + l > r) ? "vertical" : "horizontal";
}, br = function(e, t, n) {
	var r = n ? e.left : e.top, i = n ? e.right : e.bottom, a = n ? e.width : e.height, o = n ? t.left : t.top, s = n ? t.right : t.bottom, c = n ? t.width : t.height;
	return r === o || i === s || r + a / 2 === o + c / 2;
}, xr = function(e, t) {
	var n;
	return $n.some(function(r) {
		var i = r[B].options.emptyInsertThreshold;
		if (i && !wn(r)) {
			var a = R(r), o = e >= a.left - i && e <= a.right + i, s = t >= a.top - i && t <= a.bottom + i;
			if (o && s) return n = r;
		}
	}), n;
}, Sr = function(e) {
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
	r && on(r) == "object" || (r = { name: r }), n.name = r.name, n.checkPull = t(r.pull, !0), n.checkPut = t(r.put), n.revertClone = r.revertClone, e.group = n;
}, Cr = function() {
	!vr && G && L(G, "display", "none");
}, wr = function() {
	!vr && G && L(G, "display", "");
};
mr && !mn && document.addEventListener("click", function(e) {
	if (Qn) return e.preventDefault(), e.stopPropagation && e.stopPropagation(), e.stopImmediatePropagation && e.stopImmediatePropagation(), Qn = !1, !1;
}, !0);
var Tr = function(e) {
	if (U) {
		e = e.touches ? e.touches[0] : e;
		var t = xr(e.clientX, e.clientY);
		if (t) {
			var n = {};
			for (var r in e) e.hasOwnProperty(r) && (n[r] = e[r]);
			n.target = n.rootEl = t, n.preventDefault = void 0, n.stopPropagation = void 0, t[B]._onDragOver(n);
		}
	}
}, Er = function(e) {
	U && U.parentNode[B]._isOutsideThisEl(e.target);
};
function Q(e, t) {
	if (!(e && e.nodeType && e.nodeType === 1)) throw `Sortable: \`el\` must be an HTMLElement, not ${{}.toString.call(e)}`;
	this.el = e, this.options = t = $t({}, t), e[B] = this;
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
			return yr(e, this.options);
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
		supportPointer: Q.supportPointer !== !1 && "PointerEvent" in window && (!fn || pn),
		emptyInsertThreshold: 5
	};
	for (var r in Vn.initializePlugins(this, e, n), n) !(r in t) && (t[r] = n[r]);
	for (var i in Sr(t), this) i.charAt(0) === "_" && typeof this[i] == "function" && (this[i] = this[i].bind(this));
	this.nativeDraggable = !t.forceFallback && _r, this.nativeDraggable && (this.options.touchStartThreshold = 1), t.supportPointer ? N(e, "pointerdown", this._onTapStart) : (N(e, "mousedown", this._onTapStart), N(e, "touchstart", this._onTapStart)), this.nativeDraggable && (N(e, "dragover", this), N(e, "dragenter", this)), $n.push(this.el), t.store && t.store.get && this.sort(t.store.get(this) || []), $t(this, In());
}
Q.prototype = {
	constructor: Q,
	_isOutsideThisEl: function(e) {
		!this.el.contains(e) && e !== this.el && (or = null);
	},
	_getDirection: function(e, t) {
		return typeof this.options.direction == "function" ? this.options.direction.call(this, e, t, U) : this.options.direction;
	},
	_onTapStart: function(e) {
		if (e.cancelable) {
			var t = this, n = this.el, r = this.options, i = r.preventOnFilter, a = e.type, o = e.touches && e.touches[0] || e.pointerType && e.pointerType === "touch" && e, s = (o || e).target, c = e.target.shadowRoot && (e.path && e.path[0] || e.composedPath && e.composedPath()[0]) || s, l = r.filter;
			if (Ir(n), !U && !(/mousedown|pointerdown/.test(a) && e.button !== 0 || r.disabled) && !c.isContentEditable && !(!this.nativeDraggable && fn && s && s.tagName.toUpperCase() === "SELECT") && (s = F(s, r.draggable, n, !1), !(s && s.animated) && Gn !== s)) {
				if (qn = z(s), Jn = z(s, r.draggable), typeof l == "function") {
					if (l.call(this, e, s, this)) {
						H({
							sortable: t,
							rootEl: c,
							name: "filter",
							targetEl: s,
							toEl: n,
							fromEl: n
						}), V("filter", t, { evt: e }), i && e.preventDefault();
						return;
					}
				} else if (l && (l = l.split(",").some(function(r) {
					if (r = F(c, r.trim(), n, !1), r) return H({
						sortable: t,
						rootEl: r,
						name: "filter",
						targetEl: s,
						fromEl: n,
						toEl: n
					}), V("filter", t, { evt: e }), !0;
				}), l)) {
					i && e.preventDefault();
					return;
				}
				(!r.handle || F(c, r.handle, n, !1)) && this._prepareDragStart(e, o, s);
			}
		}
	},
	_prepareDragStart: function(e, t, n) {
		var r = this, i = r.el, a = r.options, o = i.ownerDocument, s;
		if (n && !U && n.parentNode === i) {
			var c = R(n);
			if (K = i, U = n, W = U.parentNode, Wn = U.nextSibling, Gn = n, Xn = a.group, Q.dragged = U, er = {
				target: U,
				clientX: (t || e).clientX,
				clientY: (t || e).clientY
			}, rr = er.clientX - c.left, ir = er.clientY - c.top, this._lastX = (t || e).clientX, this._lastY = (t || e).clientY, U.style["will-change"] = "all", s = function() {
				V("delayEnded", r, { evt: e }), Q.eventCanceled ? r._onDrop() : (r._disableDelayedDragEvents(), !dn && r.nativeDraggable && (U.draggable = !0), r._triggerDragStart(e, t), H({
					sortable: r,
					name: "choose",
					originalEvent: e
				}), I(U, a.chosenClass, !0));
			}, a.ignore.split(",").forEach(function(e) {
				bn(U, e.trim(), kr);
			}), N(o, "dragover", Tr), N(o, "mousemove", Tr), N(o, "touchmove", Tr), a.supportPointer ? (N(o, "pointerup", r._onDrop), !this.nativeDraggable && N(o, "pointercancel", r._onDrop)) : (N(o, "mouseup", r._onDrop), N(o, "touchend", r._onDrop), N(o, "touchcancel", r._onDrop)), dn && this.nativeDraggable && (this.options.touchStartThreshold = 4, U.draggable = !0), V("delayStart", this, { evt: e }), a.delay && (!a.delayOnTouchOnly || t) && (!this.nativeDraggable || !(un || ln))) {
				if (Q.eventCanceled) {
					this._onDrop();
					return;
				}
				a.supportPointer ? (N(o, "pointerup", r._disableDelayedDrag), N(o, "pointercancel", r._disableDelayedDrag)) : (N(o, "mouseup", r._disableDelayedDrag), N(o, "touchend", r._disableDelayedDrag), N(o, "touchcancel", r._disableDelayedDrag)), N(o, "mousemove", r._delayedDragTouchMoveHandler), N(o, "touchmove", r._delayedDragTouchMoveHandler), a.supportPointer && N(o, "pointermove", r._delayedDragTouchMoveHandler), r._dragStartTimer = setTimeout(s, a.delay);
			} else s();
		}
	},
	_delayedDragTouchMoveHandler: function(e) {
		var t = e.touches ? e.touches[0] : e;
		Math.max(Math.abs(t.clientX - this._lastX), Math.abs(t.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1)) && this._disableDelayedDrag();
	},
	_disableDelayedDrag: function() {
		U && kr(U), clearTimeout(this._dragStartTimer), this._disableDelayedDragEvents();
	},
	_disableDelayedDragEvents: function() {
		var e = this.el.ownerDocument;
		P(e, "mouseup", this._disableDelayedDrag), P(e, "touchend", this._disableDelayedDrag), P(e, "touchcancel", this._disableDelayedDrag), P(e, "pointerup", this._disableDelayedDrag), P(e, "pointercancel", this._disableDelayedDrag), P(e, "mousemove", this._delayedDragTouchMoveHandler), P(e, "touchmove", this._delayedDragTouchMoveHandler), P(e, "pointermove", this._delayedDragTouchMoveHandler);
	},
	_triggerDragStart: function(e, t) {
		t ||= e.pointerType == "touch" && e, !this.nativeDraggable || t ? this.options.supportPointer ? N(document, "pointermove", this._onTouchMove) : t ? N(document, "touchmove", this._onTouchMove) : N(document, "mousemove", this._onTouchMove) : (N(U, "dragend", this), N(K, "dragstart", this._onDragStart));
		try {
			document.selection ? Lr(function() {
				document.selection.empty();
			}) : window.getSelection().removeAllRanges();
		} catch {}
	},
	_dragStarted: function(e, t) {
		if (Zn = !1, K && U) {
			V("dragStarted", this, { evt: t }), this.nativeDraggable && N(document, "dragover", Er);
			var n = this.options;
			!e && I(U, n.dragClass, !1), I(U, n.ghostClass, !0), Q.active = this, e && this._appendGhost(), H({
				sortable: this,
				name: "start",
				originalEvent: t
			});
		} else this._nulling();
	},
	_emulateDragOver: function() {
		if (X) {
			this._lastX = X.clientX, this._lastY = X.clientY, Cr();
			for (var e = document.elementFromPoint(X.clientX, X.clientY), t = e; e && e.shadowRoot && (e = e.shadowRoot.elementFromPoint(X.clientX, X.clientY), e !== t);) t = e;
			if (U.parentNode[B]._isOutsideThisEl(e), t) do {
				if (t[B]) {
					var n = void 0;
					if (n = t[B]._onDragOver({
						clientX: X.clientX,
						clientY: X.clientY,
						target: e,
						rootEl: t
					}), n && !this.options.dragoverBubble) break;
				}
				e = t;
			} while (t = _n(t));
			wr();
		}
	},
	_onTouchMove: function(e) {
		if (er) {
			var t = this.options, n = t.fallbackTolerance, r = t.fallbackOffset, i = e.touches ? e.touches[0] : e, a = G && yn(G, !0), o = G && a && a.a, s = G && a && a.d, c = hr && Z && Tn(Z), l = (i.clientX - er.clientX + r.x) / (o || 1) + (c ? c[0] - dr[0] : 0) / (o || 1), u = (i.clientY - er.clientY + r.y) / (s || 1) + (c ? c[1] - dr[1] : 0) / (s || 1);
			if (!Q.active && !Zn) {
				if (n && Math.max(Math.abs(i.clientX - this._lastX), Math.abs(i.clientY - this._lastY)) < n) return;
				this._onDragStart(e, !0);
			}
			if (G) {
				a ? (a.e += l - (tr || 0), a.f += u - (nr || 0)) : a = {
					a: 1,
					b: 0,
					c: 0,
					d: 1,
					e: l,
					f: u
				};
				var d = `matrix(${a.a},${a.b},${a.c},${a.d},${a.e},${a.f})`;
				L(G, "webkitTransform", d), L(G, "mozTransform", d), L(G, "msTransform", d), L(G, "transform", d), tr = l, nr = u, X = i;
			}
			e.cancelable && e.preventDefault();
		}
	},
	_appendGhost: function() {
		if (!G) {
			var e = this.options.fallbackOnBody ? document.body : K, t = R(U, !0, hr, !0, e), n = this.options;
			if (hr) {
				for (Z = e; L(Z, "position") === "static" && L(Z, "transform") === "none" && Z !== document;) Z = Z.parentNode;
				Z !== document.body && Z !== document.documentElement ? (Z === document && (Z = xn()), t.top += Z.scrollTop, t.left += Z.scrollLeft) : Z = xn(), dr = Tn(Z);
			}
			G = U.cloneNode(!0), I(G, n.ghostClass, !1), I(G, n.fallbackClass, !0), I(G, n.dragClass, !0), L(G, "transition", ""), L(G, "transform", ""), L(G, "box-sizing", "border-box"), L(G, "margin", 0), L(G, "top", t.top), L(G, "left", t.left), L(G, "width", t.width), L(G, "height", t.height), L(G, "opacity", "0.8"), L(G, "position", hr ? "absolute" : "fixed"), L(G, "zIndex", "100000"), L(G, "pointerEvents", "none"), Q.ghost = G, e.appendChild(G), L(G, "transform-origin", rr / parseInt(G.style.width) * 100 + "% " + ir / parseInt(G.style.height) * 100 + "%");
		}
	},
	_onDragStart: function(e, t) {
		var n = this, r = e.dataTransfer, i = n.options;
		V("dragStart", this, { evt: e }), Q.eventCanceled ? this._onDrop() : (V("setupClone", this), Q.eventCanceled || (q = Pn(U), q.removeAttribute("id"), q.draggable = !1, q.style["will-change"] = "", this._hideClone(), I(q, this.options.chosenClass, !1), Q.clone = q), n.cloneId = Lr(function() {
			V("clone", n), Q.eventCanceled || (n.options.removeCloneOnHide || K.insertBefore(q, U), n._hideClone(), H({
				sortable: n,
				name: "clone"
			}));
		}), !t && I(U, i.dragClass, !0), t ? (Qn = !0, n._loopId = setInterval(n._emulateDragOver, 50)) : (P(document, "mouseup", n._onDrop), P(document, "touchend", n._onDrop), P(document, "touchcancel", n._onDrop), r && (r.effectAllowed = "move", i.setData && i.setData.call(n, r, U)), N(document, "drop", n), L(U, "transform", "translateZ(0)")), Zn = !0, n._dragStartId = Lr(n._dragStarted.bind(n, t, e)), N(document, "selectstart", n), ar = !0, window.getSelection().removeAllRanges(), fn && L(document.body, "user-select", "none"));
	},
	_onDragOver: function(e) {
		var t = this.el, n = e.target, r, i, a, o = this.options, s = o.group, c = Q.active, l = Xn === s, u = o.sort, d = Y || c, f, p = this, m = !1;
		if (fr) return;
		function h(o, s) {
			V(o, p, M({
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
					return Or(K, t, U, r, n, R(n), e, i);
				},
				changed: te
			}, s));
		}
		function ee() {
			h("dragOverAnimationCapture"), p.captureAnimationState(), p !== d && d.captureAnimationState();
		}
		function g(r) {
			return h("dragOverCompleted", { insertion: r }), r && (l ? c._hideClone() : c._showClone(p), p !== d && (I(U, Y ? Y.options.ghostClass : c.options.ghostClass, !1), I(U, o.ghostClass, !0)), Y !== p && p !== Q.active ? Y = p : p === Q.active && Y && (Y = null), d === p && (p._ignoreWhileAnimating = n), p.animateAll(function() {
				h("dragOverAnimationComplete"), p._ignoreWhileAnimating = null;
			}), p !== d && (d.animateAll(), d._ignoreWhileAnimating = null)), (n === U && !U.animated || n === t && !n.animated) && (or = null), !o.dragoverBubble && !e.rootEl && n !== document && (U.parentNode[B]._isOutsideThisEl(e.target), !r && Tr(e)), !o.dragoverBubble && e.stopPropagation && e.stopPropagation(), m = !0;
		}
		function te() {
			J = z(U), Yn = z(U, o.draggable), H({
				sortable: p,
				name: "change",
				toEl: t,
				newIndex: J,
				newDraggableIndex: Yn,
				originalEvent: e
			});
		}
		if (e.preventDefault !== void 0 && e.cancelable && e.preventDefault(), n = F(n, o.draggable, t, !0), h("dragOver"), Q.eventCanceled) return m;
		if (U.contains(e.target) || n.animated && n.animatingX && n.animatingY || p._ignoreWhileAnimating === n) return g(!1);
		if (Qn = !1, c && !o.disabled && (l ? u || (a = W !== K) : Y === this || (this.lastPutMode = Xn.checkPull(this, c, U, e)) && s.checkPut(this, c, U, e))) {
			if (f = this._getDirection(e, n) === "vertical", r = R(U), h("dragOverValid"), Q.eventCanceled) return m;
			if (a) return W = K, ee(), this._hideClone(), h("revert"), Q.eventCanceled || (Wn ? K.insertBefore(U, Wn) : K.appendChild(U)), g(!0);
			var _ = wn(t, o.draggable);
			if (!_ || Mr(e, f, this) && !_.animated) {
				if (_ === U) return g(!1);
				if (_ && t === e.target && (n = _), n && (i = R(n)), Or(K, t, U, r, n, i, e, !!n) !== !1) return ee(), _ && _.nextSibling ? t.insertBefore(U, _.nextSibling) : t.appendChild(U), W = t, te(), g(!0);
			} else if (_ && jr(e, f, this)) {
				var ne = Cn(t, 0, o, !0);
				if (ne === U) return g(!1);
				if (n = ne, i = R(n), Or(K, t, U, r, n, i, e, !1) !== !1) return ee(), t.insertBefore(U, ne), W = t, te(), g(!0);
			} else if (n.parentNode === t) {
				i = R(n);
				var v = 0, re, y = U.parentNode !== t, ie = !br(U.animated && U.toRect || r, n.animated && n.toRect || i, f), b = f ? "top" : "left", x = Sn(n, "top", "top") || Sn(U, "top", "top"), ae = x ? x.scrollTop : void 0;
				or !== n && (re = i[b], cr = !1, lr = !ie && o.invertSwap || y), v = Nr(e, n, i, f, ie ? 1 : o.swapThreshold, o.invertedSwapThreshold == null ? o.swapThreshold : o.invertedSwapThreshold, lr, or === n);
				var S;
				if (v !== 0) {
					var C = z(U);
					do
						C -= v, S = W.children[C];
					while (S && (L(S, "display") === "none" || S === G));
				}
				if (v === 0 || S === n) return g(!1);
				or = n, sr = v;
				var oe = n.nextElementSibling, se = !1;
				se = v === 1;
				var w = Or(K, t, U, r, n, i, e, se);
				if (w !== !1) return (w === 1 || w === -1) && (se = w === 1), fr = !0, setTimeout(Ar, 30), ee(), se && !oe ? t.appendChild(U) : n.parentNode.insertBefore(U, se ? oe : n), x && Nn(x, 0, ae - x.scrollTop), W = U.parentNode, re !== void 0 && !lr && (ur = Math.abs(re - R(n)[b])), te(), g(!0);
			}
			if (t.contains(U)) return g(!1);
		}
		return !1;
	},
	_ignoreWhileAnimating: null,
	_offMoveEvents: function() {
		P(document, "mousemove", this._onTouchMove), P(document, "touchmove", this._onTouchMove), P(document, "pointermove", this._onTouchMove), P(document, "dragover", Tr), P(document, "mousemove", Tr), P(document, "touchmove", Tr);
	},
	_offUpEvents: function() {
		var e = this.el.ownerDocument;
		P(e, "mouseup", this._onDrop), P(e, "touchend", this._onDrop), P(e, "pointerup", this._onDrop), P(e, "pointercancel", this._onDrop), P(e, "touchcancel", this._onDrop), P(document, "selectstart", this);
	},
	_onDrop: function(e) {
		var t = this.el, n = this.options;
		J = z(U), Yn = z(U, n.draggable), V("drop", this, { evt: e }), W = U && U.parentNode, J = z(U), Yn = z(U, n.draggable), Q.eventCanceled || (Zn = !1, lr = !1, cr = !1, clearInterval(this._loopId), clearTimeout(this._dragStartTimer), Rr(this.cloneId), Rr(this._dragStartId), this.nativeDraggable && (P(document, "drop", this), P(t, "dragstart", this._onDragStart)), this._offMoveEvents(), this._offUpEvents(), fn && L(document.body, "user-select", ""), L(U, "transform", ""), e && (ar && (e.cancelable && e.preventDefault(), !n.dropBubble && e.stopPropagation()), G && G.parentNode && G.parentNode.removeChild(G), (K === W || Y && Y.lastPutMode !== "clone") && q && q.parentNode && q.parentNode.removeChild(q), U && (this.nativeDraggable && P(U, "dragend", this), kr(U), U.style["will-change"] = "", ar && !Zn && I(U, Y ? Y.options.ghostClass : this.options.ghostClass, !1), I(U, this.options.chosenClass, !1), H({
			sortable: this,
			name: "unchoose",
			toEl: W,
			newIndex: null,
			newDraggableIndex: null,
			originalEvent: e
		}), K === W ? J !== qn && J >= 0 && (H({
			sortable: this,
			name: "update",
			toEl: W,
			originalEvent: e
		}), H({
			sortable: this,
			name: "sort",
			toEl: W,
			originalEvent: e
		})) : (J >= 0 && (H({
			rootEl: W,
			name: "add",
			toEl: W,
			fromEl: K,
			originalEvent: e
		}), H({
			sortable: this,
			name: "remove",
			toEl: W,
			originalEvent: e
		}), H({
			rootEl: W,
			name: "sort",
			toEl: W,
			fromEl: K,
			originalEvent: e
		}), H({
			sortable: this,
			name: "sort",
			toEl: W,
			originalEvent: e
		})), Y && Y.save()), Q.active && ((J == null || J === -1) && (J = qn, Yn = Jn), H({
			sortable: this,
			name: "end",
			toEl: W,
			originalEvent: e
		}), this.save())))), this._nulling();
	},
	_nulling: function() {
		V("nulling", this), K = U = W = G = Wn = q = Gn = Kn = er = X = ar = J = Yn = qn = Jn = or = sr = Y = Xn = Q.dragged = Q.ghost = Q.clone = Q.active = null;
		var e = this.el;
		pr.forEach(function(t) {
			e.contains(t) && (t.checked = !0);
		}), pr.length = tr = nr = 0;
	},
	handleEvent: function(e) {
		switch (e.type) {
			case "drop":
			case "dragend":
				this._onDrop(e);
				break;
			case "dragenter":
			case "dragover":
				U && (this._onDragOver(e), Dr(e));
				break;
			case "selectstart": e.preventDefault();
		}
	},
	toArray: function() {
		for (var e = [], t, n = this.el.children, r = 0, i = n.length, a = this.options; r < i; r++) t = n[r], F(t, a.draggable, this.el, !1) && e.push(t.getAttribute(a.dataIdAttr) || Fr(t));
		return e;
	},
	sort: function(e, t) {
		var n = {}, r = this.el;
		this.toArray().forEach(function(e, t) {
			var i = r.children[t];
			F(i, this.options.draggable, r, !1) && (n[e] = i);
		}, this), t && this.captureAnimationState(), e.forEach(function(e) {
			n[e] && (r.removeChild(n[e]), r.appendChild(n[e]));
		}), t && this.animateAll();
	},
	save: function() {
		var e = this.options.store;
		e && e.set && e.set(this);
	},
	closest: function(e, t) {
		return F(e, t || this.options.draggable, this.el, !1);
	},
	option: function(e, t) {
		var n = this.options;
		if (t === void 0) return n[e];
		var r = Vn.modifyOption(this, e, t);
		n[e] = r === void 0 ? t : r, e === "group" && Sr(n);
	},
	destroy: function() {
		V("destroy", this);
		var e = this.el;
		e[B] = null, P(e, "mousedown", this._onTapStart), P(e, "touchstart", this._onTapStart), P(e, "pointerdown", this._onTapStart), this.nativeDraggable && (P(e, "dragover", this), P(e, "dragenter", this)), Array.prototype.forEach.call(e.querySelectorAll("[draggable]"), function(e) {
			e.removeAttribute("draggable");
		}), this._onDrop(), this._disableDelayedDragEvents(), $n.splice($n.indexOf(this.el), 1), this.el = e = null;
	},
	_hideClone: function() {
		if (!Kn) {
			if (V("hideClone", this), Q.eventCanceled) return;
			L(q, "display", "none"), this.options.removeCloneOnHide && q.parentNode && q.parentNode.removeChild(q), Kn = !0;
		}
	},
	_showClone: function(e) {
		if (e.lastPutMode !== "clone") this._hideClone();
		else if (Kn) {
			if (V("showClone", this), Q.eventCanceled) return;
			U.parentNode == K && !this.options.group.revertClone ? K.insertBefore(q, U) : Wn ? K.insertBefore(q, Wn) : K.appendChild(q), this.options.group.revertClone && this.animate(U, q), L(q, "display", ""), Kn = !1;
		}
	}
};
function Dr(e) {
	e.dataTransfer && (e.dataTransfer.dropEffect = "move"), e.cancelable && e.preventDefault();
}
function Or(e, t, n, r, i, a, o, s) {
	var c, l = e[B], u = l.options.onMove, d;
	return window.CustomEvent && !ln && !un ? c = new CustomEvent("move", {
		bubbles: !0,
		cancelable: !0
	}) : (c = document.createEvent("Event"), c.initEvent("move", !0, !0)), c.to = t, c.from = e, c.dragged = n, c.draggedRect = r, c.related = i || t, c.relatedRect = a || R(t), c.willInsertAfter = s, c.originalEvent = o, e.dispatchEvent(c), u && (d = u.call(l, c, o)), d;
}
function kr(e) {
	e.draggable = !1;
}
function Ar() {
	fr = !1;
}
function jr(e, t, n) {
	var r = R(Cn(n.el, 0, n.options, !0)), i = Fn(n.el, n.options, G), a = 10;
	return t ? e.clientX < i.left - a || e.clientY < r.top && e.clientX < r.right : e.clientY < i.top - a || e.clientY < r.bottom && e.clientX < r.left;
}
function Mr(e, t, n) {
	var r = R(wn(n.el, n.options.draggable)), i = Fn(n.el, n.options, G), a = 10;
	return t ? e.clientX > i.right + a || e.clientY > r.bottom && e.clientX > r.left : e.clientY > i.bottom + a || e.clientX > r.right && e.clientY > r.top;
}
function Nr(e, t, n, r, i, a, o, s) {
	var c = r ? e.clientY : e.clientX, l = r ? n.height : n.width, u = r ? n.top : n.left, d = r ? n.bottom : n.right, f = !1;
	if (!o) {
		if (s && ur < l * i) {
			if (!cr && (sr === 1 ? c > u + l * a / 2 : c < d - l * a / 2) && (cr = !0), cr) f = !0;
			else if (sr === 1 ? c < u + ur : c > d - ur) return -sr;
		} else if (c > u + l * (1 - i) / 2 && c < d - l * (1 - i) / 2) return Pr(t);
	}
	return f ||= o, f && (c < u + l * a / 2 || c > d - l * a / 2) ? c > u + l / 2 ? 1 : -1 : 0;
}
function Pr(e) {
	return z(U) < z(e) ? 1 : -1;
}
function Fr(e) {
	for (var t = e.tagName + e.className + e.src + e.href + e.textContent, n = t.length, r = 0; n--;) r += t.charCodeAt(n);
	return r.toString(36);
}
function Ir(e) {
	pr.length = 0;
	for (var t = e.getElementsByTagName("input"), n = t.length; n--;) {
		var r = t[n];
		r.checked && pr.push(r);
	}
}
function Lr(e) {
	return setTimeout(e, 0);
}
function Rr(e) {
	return clearTimeout(e);
}
mr && N(document, "touchmove", function(e) {
	(Q.active || Zn) && e.cancelable && e.preventDefault();
}), Q.utils = {
	on: N,
	off: P,
	css: L,
	find: bn,
	is: function(e, t) {
		return !!F(e, t, e, !1);
	},
	extend: On,
	throttle: jn,
	closest: F,
	toggleClass: I,
	clone: Pn,
	index: z,
	nextTick: Lr,
	cancelNextTick: Rr,
	detectDirection: yr,
	getChild: Cn,
	expando: B
}, Q.get = function(e) {
	return e[B];
}, Q.mount = function() {
	var e = [...arguments];
	e[0].constructor === Array && (e = e[0]), e.forEach(function(e) {
		if (!e.prototype || !e.prototype.constructor) throw `Sortable: Mounted plugin must be a constructor function, not ${{}.toString.call(e)}`;
		e.utils && (Q.utils = M(M({}, Q.utils), e.utils)), Vn.mount(e);
	});
}, Q.create = function(e, t) {
	return new Q(e, t);
}, Q.version = sn;
var $ = [], zr, Br, Vr = !1, Hr, Ur, Wr, Gr;
function Kr() {
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
			this.sortable.nativeDraggable ? N(document, "dragover", this._handleAutoScroll) : this.options.supportPointer ? N(document, "pointermove", this._handleFallbackAutoScroll) : t.touches ? N(document, "touchmove", this._handleFallbackAutoScroll) : N(document, "mousemove", this._handleFallbackAutoScroll);
		},
		dragOverCompleted: function(e) {
			var t = e.originalEvent;
			!this.options.dragOverBubble && !t.rootEl && this._handleAutoScroll(t);
		},
		drop: function() {
			this.sortable.nativeDraggable ? P(document, "dragover", this._handleAutoScroll) : (P(document, "pointermove", this._handleFallbackAutoScroll), P(document, "touchmove", this._handleFallbackAutoScroll), P(document, "mousemove", this._handleFallbackAutoScroll)), Jr(), qr(), Mn();
		},
		nulling: function() {
			Wr = Br = zr = Vr = Gr = Hr = Ur = null, $.length = 0;
		},
		_handleFallbackAutoScroll: function(e) {
			this._handleAutoScroll(e, !0);
		},
		_handleAutoScroll: function(e, t) {
			var n = this, r = (e.touches ? e.touches[0] : e).clientX, i = (e.touches ? e.touches[0] : e).clientY, a = document.elementFromPoint(r, i);
			if (Wr = e, t || this.options.forceAutoScrollFallback || un || ln || fn) {
				Yr(e, this.options, a, t);
				var o = Dn(a, !0);
				Vr && (!Gr || r !== Hr || i !== Ur) && (Gr && Jr(), Gr = setInterval(function() {
					var a = Dn(document.elementFromPoint(r, i), !0);
					a !== o && (o = a, qr()), Yr(e, n.options, a, t);
				}, 10), Hr = r, Ur = i);
			} else {
				if (!this.options.bubbleScroll || Dn(a, !0) === xn()) {
					qr();
					return;
				}
				Yr(e, this.options, Dn(a, !1), !1);
			}
		}
	}, $t(e, {
		pluginName: "scroll",
		initializeByDefault: !0
	});
}
function qr() {
	$.forEach(function(e) {
		clearInterval(e.pid);
	}), $ = [];
}
function Jr() {
	clearInterval(Gr);
}
var Yr = jn(function(e, t, n, r) {
	if (t.scroll) {
		var i = (e.touches ? e.touches[0] : e).clientX, a = (e.touches ? e.touches[0] : e).clientY, o = t.scrollSensitivity, s = t.scrollSpeed, c = xn(), l = !1, u;
		Br !== n && (Br = n, qr(), zr = t.scroll, u = t.scrollFn, zr === !0 && (zr = Dn(n, !0)));
		var d = 0, f = zr;
		do {
			var p = f, m = R(p), h = m.top, ee = m.bottom, g = m.left, te = m.right, _ = m.width, ne = m.height, v = void 0, re = void 0, y = p.scrollWidth, ie = p.scrollHeight, b = L(p), x = p.scrollLeft, ae = p.scrollTop;
			p === c ? (v = _ < y && (b.overflowX === "auto" || b.overflowX === "scroll" || b.overflowX === "visible"), re = ne < ie && (b.overflowY === "auto" || b.overflowY === "scroll" || b.overflowY === "visible")) : (v = _ < y && (b.overflowX === "auto" || b.overflowX === "scroll"), re = ne < ie && (b.overflowY === "auto" || b.overflowY === "scroll"));
			var S = v && (Math.abs(te - i) <= o && x + _ < y) - (Math.abs(g - i) <= o && !!x), C = re && (Math.abs(ee - a) <= o && ae + ne < ie) - (Math.abs(h - a) <= o && !!ae);
			if (!$[d]) for (var oe = 0; oe <= d; oe++) $[oe] || ($[oe] = {});
			($[d].vx != S || $[d].vy != C || $[d].el !== p) && ($[d].el = p, $[d].vx = S, $[d].vy = C, clearInterval($[d].pid), (S != 0 || C != 0) && (l = !0, $[d].pid = setInterval(function() {
				r && this.layer === 0 && Q.active._onTouchMove(Wr);
				var t = $[this.layer].vy ? $[this.layer].vy * s : 0, n = $[this.layer].vx ? $[this.layer].vx * s : 0;
				(typeof u != "function" || u.call(Q.dragged.parentNode[B], n, t, e, Wr, $[this.layer].el) === "continue") && Nn($[this.layer].el, n, t);
			}.bind({ layer: d }), 24))), d++;
		} while (t.bubbleScroll && f !== c && (f = Dn(f, !1)));
		Vr = l;
	}
}, 30), Xr = function(e) {
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
function Zr() {}
Zr.prototype = {
	startIndex: null,
	dragStart: function(e) {
		var t = e.oldDraggableIndex;
		this.startIndex = t;
	},
	onSpill: function(e) {
		var t = e.dragEl, n = e.putSortable;
		this.sortable.captureAnimationState(), n && n.captureAnimationState();
		var r = Cn(this.sortable.el, this.startIndex, this.options);
		r ? this.sortable.el.insertBefore(t, r) : this.sortable.el.appendChild(t), this.sortable.animateAll(), n && n.animateAll();
	},
	drop: Xr
}, $t(Zr, { pluginName: "revertOnSpill" });
function Qr() {}
Qr.prototype = {
	onSpill: function(e) {
		var t = e.dragEl, n = e.putSortable || this.sortable;
		n.captureAnimationState(), t.parentNode && t.parentNode.removeChild(t), n.animateAll();
	},
	drop: Xr
}, $t(Qr, { pluginName: "removeOnSpill" }), Q.mount(new Kr()), Q.mount(Qr, Zr);
// src/image.js
var $r = 1600;
async function ei(e) {
	let t = await createImageBitmap(e, { imageOrientation: "from-image" }), n = Math.min(1, $r / Math.max(t.width, t.height)), r = document.createElement("canvas");
	r.width = Math.round(t.width * n), r.height = Math.round(t.height * n);
	let i = r.getContext("2d");
	i.fillStyle = "#fff", i.fillRect(0, 0, r.width, r.height), i.drawImage(t, 0, 0, r.width, r.height), t.close();
	let a = r.toDataURL("image/jpeg", .85);
	return a.slice(a.indexOf(",") + 1);
}
// src/sections.js
function ti(e) {
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
function ni(e, t, n) {
	let r = n.trim() || null;
	return e.map((e, n) => n >= t.start && n <= t.end ? {
		...e,
		section: r
	} : e);
}
function ri(e, t, n) {
	let r = ti(e), i = r.find((e) => t >= e.start && t <= e.end), a = n < 0 ? t === i.start : t === i.end, o = r[r.indexOf(i) + n];
	if (a) return o ? e.map((e, n) => n === t ? {
		...e,
		section: o.section
	} : e) : e;
	let s = [...e];
	return [s[t], s[t + n]] = [s[t + n], s[t]], s;
}
function ii(e, t, n) {
	let r = [...e];
	return r.splice(t.end + 1, 0, {
		...n,
		section: t.section
	}), r;
}
function ai(e, t, n, r, i) {
	let a = ti(e).map((t) => ({
		section: t.section,
		items: e.slice(t.start, t.end + 1)
	})), [o] = a[t].items.splice(n, 1);
	return a[r].items.splice(i, 0, o), a.flatMap((e) => e.items.map((t) => ({
		...t,
		section: e.section
	})));
}
function oi(e, t) {
	let n = e[t].text.trim().replace(/[:：]$/, ""), r = e.filter((e, n) => n !== t), i = ti(r).find((e) => t >= e.start && t <= e.end);
	return i ? r.map((e, r) => r >= t && r <= i.end ? {
		...e,
		section: n
	} : e) : r;
}
function si(e, t) {
	let n = ti(e).find((e) => e.end === t.start - 1), r = n ? n.section : null, i = {
		text: t.section,
		section: r
	}, a = e.map((e, n) => n >= t.start && n <= t.end ? {
		...e,
		section: r
	} : e);
	return a.splice(t.start, 0, i), a;
}
// src/views/editor.js
var ci = (e) => e == null ? e : Math.round(e * 100) / 100, li = (e) => e === "" || e == null ? null : ci(Number(e)), ui = 0, di = (e) => ({
	...e,
	_key: ++ui
}), fi = ({ _key: e, _raw: t, ...n }) => n, pi = (e) => !(!e._raw || e.ingredient_id), mi = (e) => e && e.trim() ? e.trim() : null, hi = class extends D {
	static properties = {
		api: { attribute: !1 },
		recipe: { attribute: !1 },
		ingredients: { attribute: !1 },
		units: { attribute: !1 },
		t: { attribute: !1 },
		uiLang: {},
		languages: { attribute: !1 },
		newIngredients: { attribute: !1 },
		tags: { attribute: !1 },
		newTags: { attribute: !1 },
		suggestedTags: { attribute: !1 },
		fixedLanguage: { type: Boolean },
		_r: { state: !0 },
		_new: { state: !0 },
		_newTags: { state: !0 },
		_suggested: { state: !0 },
		_uploading: { state: !0 },
		_imageError: { state: !0 }
	};
	static styles = [O, o`
      :host { display: grid; gap: 16px; }
      .grid2 { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
      .grid2 .wide { grid-column: span 2; }
      .yield { display: flex; gap: 6px; }
      .yield input { width: 0; flex: 1 1 60px; }
      .yield select { width: 0; flex: 1 1 80px; }
      .line { display: grid; gap: 8px; align-items: center; margin-bottom: 10px;
        grid-template-columns: minmax(160px, 2fr) 80px minmax(90px, 1fr) minmax(120px, 2fr) auto; }
      .line.head { color: var(--it-muted); font-size: 0.75rem; margin-bottom: 4px; }
      .raw { grid-column: 1 / -1; font-size: 0.85rem; }
      @media (max-width: 800px) {
        .line { grid-template-columns: 1fr 1fr; padding-bottom: 10px; border-bottom: var(--it-row-rule); }
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
      .suggested { margin-top: 10px; font-size: 0.85rem; }
    `];
	willUpdate(e) {
		if ((e.has("newIngredients") || !this._new) && (this._new = structuredClone(this.newIngredients || [])), (e.has("newTags") || !this._newTags) && (this._newTags = structuredClone(this.newTags || [])), (e.has("suggestedTags") || !this._suggested) && (this._suggested = [...this.suggestedTags || []]), e.has("recipe")) {
			let e = structuredClone(this.recipe);
			this._r = {
				...e,
				ingredients: e.ingredients.map(di),
				steps: e.steps.map(di)
			};
		}
	}
	get value() {
		let e = this._r.ingredients.filter((e) => !pi(e)).map(fi);
		return {
			...this._r,
			ingredients: e,
			steps: this._r.steps.map(fi)
		};
	}
	get unmatchedLines() {
		return this._r.ingredients.filter(pi).map((e) => ({
			text: e._raw,
			section: e.section ?? null
		}));
	}
	showUnmatched() {
		let e = this.renderRoot.querySelector(".line.unmatched");
		e?.scrollIntoView({
			behavior: "smooth",
			block: "center"
		}), e?.querySelector("itadaki-combo")?.focus({ preventScroll: !0 });
	}
	get newIngredientsUsed() {
		let e = new Set(this._r.ingredients.map((e) => e.ingredient_id));
		return this._new.filter((t) => e.has(t.id));
	}
	get newTagsUsed() {
		return this._newTags.filter((e) => this._r.tags.includes(e.id));
	}
	get suggestedTagsLeft() {
		return this._suggested;
	}
	get _allTags() {
		return [...this.tags || [], ...this._newTags];
	}
	_createTag(e) {
		let t = {
			id: ft(e, new Set(this._allTags.map((e) => e.id)), "tag"),
			kind: "recipe",
			localized: { [this._r.language]: {
				name: e,
				plural: null,
				aliases: []
			} }
		};
		this._newTags = [...this._newTags, t], this._set("tags", [...this._r.tags, t.id]);
	}
	_useSuggestion(e) {
		this._suggested = this._suggested.filter((t) => t !== e);
		let t = dt(this._allTags, e);
		t ? this._r.tags.includes(t.id) || this._set("tags", [...this._r.tags, t.id]) : this._createTag(e);
	}
	_create(e, t) {
		let n = {
			id: ft(t, new Set([...this.ingredients, ...this._new].map((e) => e.id))),
			localized: { [this._r.language]: {
				name: t,
				plural: null,
				aliases: []
			} },
			density: null
		};
		this._new = [...this._new, n], this._setItem("ingredients", e, "ingredient_id", n.id);
	}
	_replaceNew(e, t) {
		this._set("ingredients", this._r.ingredients.map((n) => n.ingredient_id === e ? {
			...n,
			ingredient_id: t
		} : n));
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
	updated(e) {
		if (e.has("_r")) {
			let e = this._r.ingredients.filter(pi).length;
			e !== this._unmatchedCount && (this._unmatchedCount = e, this.dispatchEvent(new CustomEvent("unmatched-changed", { detail: { count: e } })));
		}
		this._sortables ??= /* @__PURE__ */ new WeakMap();
		for (let e of this.renderRoot.querySelectorAll(".items")) {
			if (this._sortables.has(e)) continue;
			let t;
			this._sortables.set(e, Q.create(e, {
				group: e.dataset.list,
				handle: ".handle",
				draggable: ".item",
				animation: 150,
				onStart: (e) => t = e.item.nextSibling,
				onEnd: (e) => {
					e.from.insertBefore(e.item, t);
					let n = e.from.dataset.list, r = Number(e.from.dataset.block), i = Number(e.to.dataset.block);
					(r !== i || e.oldIndex !== e.newIndex) && this._set(n, ai(this._r[n], r, e.oldIndex, i, e.newIndex));
				}
			}));
		}
	}
	async _upload(e) {
		let t = e.target.files[0];
		if (e.target.value = "", t) {
			this._uploading = !0, this._imageError = void 0;
			try {
				let { image_url: e } = await this.api.call("upload_image", { data: await ei(t) });
				this._set("image_url", e);
			} catch (e) {
				this._imageError = this.t.error(e);
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
      <button class="x" title="▲" @click=${() => this._set(e, ri(a, t, -1))}>▲</button>
      <button class="x" title="▼" @click=${() => this._set(e, ri(a, t, 1))}>▼</button>
      ${e === "steps" ? T`<button class="x" title=${i("makeHeading")} @click=${() => this._set(e, oi(a, t))}>H</button>` : E}
      <button class="x del" title=${i("remove")} @click=${() => this._remove(e, t)}>×</button>
    </span>`;
		return T`
      ${ti(a).map((s, c) => T`<div class="block ${s.section ? "named" : ""}">
          <div class="row">
            <itadaki-text class="block-title" .value=${s.section || ""} placeholder=${i("sectionPlaceholder")}
              @change=${(t) => this._set(e, ni(a, s, t.target.value))}></itadaki-text>
            ${e === "steps" && s.section ? T`<button class="x" title=${i("headingToStep")} @click=${() => this._set(e, si(a, s))}>↧</button>` : E}
          </div>
          <div class="items" data-list=${e} data-block=${c}>
            ${Zt(a.slice(s.start, s.end + 1), (e) => e._key, (e, n) => T`<div class="item">
                <span class="handle" title=${i("drag")}>⋮⋮</span>${t(e, s.start + n, o(s.start + n))}
              </div>`)}
          </div>
          <button class="btn quiet" @click=${() => this._set(e, ii(a, s, di(n())))}>+ ${r}</button>
        </div>`)}
      <button class="btn quiet" @click=${() => {
			let t = a.length ? prompt(i("newSection"))?.trim() : null;
			t !== void 0 && t !== "" && this._set(e, [...a, di({
				...n(),
				section: t
			})]);
		}}>+ ${a.length ? i("addSection") : r}</button>
    `;
	}
	render() {
		let e = this.t, t = this._r, n = t.language, r = (e, t) => k(e, n).localeCompare(k(t, n)), i = [...this.ingredients].sort(r), a = [...this.ingredients, ...this._new].sort(r), o = [...this.units].sort((e, t) => k(e, n).localeCompare(k(t, n))), s = (e, n, r = "text") => T`<div>
      <label>${n}</label>
      ${r === "number" ? T`<input type="number" .value=${t[e] ?? ""} @input=${(t) => this._set(e, li(t.target.value))} />` : T`<itadaki-text .value=${t[e] ?? ""} @input=${(t) => this._set(e, t.target.value)}></itadaki-text>`}
    </div>`, c = Je(n, qe(this.languages, n, this.uiLang)), l = [.../* @__PURE__ */ new Set([n, ...this.languages])], u = new Map(a.map((e) => [e.id, e])), d = this.newIngredientsUsed;
		return T`
      <div class="card about"><div class="split"><div>
        ${s("title", e("title"))}
        ${this.fixedLanguage ? E : this._languagePicker()}
        <label>${e("description")}</label>
        <textarea rows="2" .value=${t.description || ""} @input=${(e) => this._set("description", e.target.value)}></textarea>
        <div class="grid2">
          <div class="wide">
            <label>${e("yield")}</label>
            <div class="yield">
              <input type="number" aria-label=${e("yieldAmount")} .value=${t.yield_quantity ?? ""}
                @input=${(e) => this._set("yield_quantity", li(e.target.value))} />
              <select @change=${(e) => this._set("yield_unit_id", e.target.value || null)}>
                <option value="" ?selected=${!t.yield_unit_id}>${e("people")}</option>
                ${o.map((e) => T`<option value=${e.id} ?selected=${e.id === t.yield_unit_id}>${k(e, n)}</option>`)}
              </select>
            </div>
          </div>
          ${s("prep_minutes", e("prepMinutes"), "number")}
          ${s("cook_minutes", e("cookMinutes"), "number")}
          ${s("total_minutes", e("totalMinutes"), "number")}
        </div>
      </div><div>${this._photo()}</div></div></div>

      ${d.length ? T`<div class="card">
            <h2>${e("newIngredients")}</h2>
            <div class="muted">${e("newIngredientsExplain")}</div>
            <div class="names head">
              ${l.map((t) => T`<label>${e.langName(t)}${t === n ? T` · ${e("usedAs")}` : E}</label>`)}
              <label>${e("useExisting")}</label>
            </div>
            ${Zt(d, (e) => e.id, (t) => T`<div class="names">
                ${l.map((e) => T`<itadaki-text .value=${t.localized[e]?.name || ""}
                    @change=${(n) => this._rename(t.id, e, n.target.value)}></itadaki-text>`)}
                <itadaki-combo .entries=${i} .hint=${c} noCreate placeholder=${e("ingredientSearch")}
                  @pick=${(e) => this._replaceNew(t.id, e.detail.id)}></itadaki-combo>
              </div>`)}
          </div>` : E}

      <div class="card">
        <h2>${e("ingredients")}</h2>
        <div class="line head">
          <span>${e("ingredient")}</span><span>${e("amount")}</span>
          <span>${e("unit")}</span><span>${e("lineNote")}</span><span></span>
        </div>
        ${this._blocks("ingredients", (t, r, i) => T`<div class="line ${pi(t) ? "unmatched" : ""}">
                ${t._raw ? T`<div class="raw muted">${t._raw}</div>` : E}
                <itadaki-combo .entries=${a} .hint=${c} value=${t.ingredient_id ?? ""}
                  .label=${u.has(t.ingredient_id) ? k(u.get(t.ingredient_id), n) : ""}
                  ?invalid=${!u.has(t.ingredient_id)} placeholder=${e("ingredientSearch")} createLabel=${e("create")}
                  @pick=${(e) => this._setItem("ingredients", r, "ingredient_id", e.detail.id)}
                  @create=${(e) => this._create(r, e.detail.name)}></itadaki-combo>
                <input type="number" step="any" .value=${ci(t.quantity) ?? ""} placeholder=${e("amount")}
                  @input=${(e) => this._setItem("ingredients", r, "quantity", li(e.target.value))} />
                <select @change=${(e) => this._setItem("ingredients", r, "unit_id", e.target.value || null)}>
                  <option value="" ?selected=${!t.unit_id}>—</option>
                  ${o.map((e) => T`<option value=${e.id} ?selected=${e.id === t.unit_id}>${k(e, n)}</option>`)}
                </select>
                <itadaki-text .value=${t.note || ""} placeholder=${e("lineNote")}
                  @input=${(e) => this._setItem("ingredients", r, "note", mi(e.target.value))}></itadaki-text>
                ${i}
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
        <itadaki-tags .entries=${this._allTags.sort(r)} .value=${t.tags} lang=${n} .hint=${c} .t=${e}
          placeholder=${e("tagSearch")} createLabel=${e("create")}
          @change=${(e) => this._set("tags", e.detail.value)} @create=${(e) => this._createTag(e.detail.name)}></itadaki-tags>
        ${this._suggested.length ? T`<div class="row suggested">
              <span class="muted">${e("pageTags")}</span>
              ${this._suggested.map((e) => T`<button class="chip" @click=${() => this._useSuggestion(e)}>+ ${e}</button>`)}
            </div>` : E}
      </div>
    `;
	}
};
customElements.define("itadaki-editor", hi);
// src/views/draft.js
var gi = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		languages: { attribute: !1 },
		ai: { type: Boolean },
		instructions: { attribute: !1 },
		draftId: {},
		_task: { state: !0 },
		_unmatched: { state: !0 },
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
			e.draft_id === this.draftId && (e.status === "saved" ? A(this, {
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
				let [e, t, n] = await Promise.all([
					"ingredients",
					"units",
					"recipe_tags"
				].map((e) => Ke(this.api, e)));
				this._catalog = {
					ingredients: e,
					units: t,
					tags: n
				};
			}
			this._entry = e, this._error = void 0;
		} catch (e) {
			this._error = this.t.error(e);
		}
	}
	_edited() {
		let e = this.renderRoot.querySelector("itadaki-editor");
		return {
			...structuredClone(this._entry.draft),
			recipe: e.value,
			new_ingredients: e.newIngredientsUsed,
			new_tags: e.newTagsUsed,
			suggested_tags: e.suggestedTagsLeft,
			raw_lines: e.unmatchedLines
		};
	}
	async _save() {
		await this._act(async () => {
			let { recipe: e } = await this.api.call("save_draft", {
				draft_id: this.draftId,
				draft: this._edited()
			});
			A(this, {
				view: "recipe",
				id: e.id,
				replace: !0
			});
		});
	}
	async _runTask(e) {
		let { note: t } = e.detail, n = {
			draft_id: this.draftId,
			draft: this._edited()
		};
		this._task === "adapt" ? n.instruction = t : t && (n.note = t);
		let r = {
			adapt: "adapt_draft",
			structure: "structure_draft",
			tag: "tag_draft"
		}[this._task];
		await this._act(() => this.api.call(r, n)), this._task = void 0, await this._load();
	}
	async _discard() {
		await this._act(async () => {
			await this.api.call("discard_draft", { draft_id: this.draftId }), A(this, { view: "back" });
		});
	}
	async _act(e) {
		this._busy = !0, this._error = void 0;
		try {
			await e();
		} catch (e) {
			this._error = this.t.error(e);
		} finally {
			this._busy = !1;
		}
	}
	render() {
		return T`<itadaki-page .t=${this.t} header=${this._entry ? this.t.action(this._entry.action) : ""}>${this._actions()}${this._content()}</itadaki-page>`;
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
		}, o = [...t.lines || [], ...n.raw_lines.map((e) => ({ name: e.text }))];
		return r ? this._renderReview(n) : T`
      <div class="card head">
        <h2>${t.title}</h2>
        ${this._request(t)}
        ${t.status === "working" ? T`<itadaki-busy .text=${e("workingLeave")}></itadaki-busy>` : E}
        ${t.error ? T`<div class="error">${t.error}</div>` : E}
        ${t.status === "failed" ? T`<button class="btn quiet" @click=${this._discard}>${e("discard")}</button>` : E}
      </div>
      <itadaki-body .recipe=${a} .lines=${o} .t=${e}></itadaki-body>
    `;
	}
	_request(e) {
		let t = this.t, n = gt(t, e);
		return T`<div class="muted" style="margin-bottom:8px">${t.action(e.action)}${n ? T` · ${n}` : E}</div>`;
	}
	_reviewRecipe(e) {
		return this._reviewOf !== e && (this._reviewOf = e, this._review = {
			...e.recipe,
			ingredients: [...e.recipe.ingredients, ...e.raw_lines.map((e) => ({
				ingredient_id: null,
				quantity: null,
				unit_id: null,
				note: null,
				section: e.section,
				_raw: e.text
			}))]
		}), this._review;
	}
	_renderReview(e) {
		let t = this.t, n = this._reviewRecipe(e);
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
        ${this._entry.error ? T`<div class="error">${t("aiFailedKept", { error: this._entry.error })}</div>` : E}
      </div>

      ${this._unmatched && this._task !== "structure" ? this._matchCard() : E}
      ${this._task ? this._taskCard() : E}

      <itadaki-editor @unmatched-changed=${(e) => this._unmatched = e.detail.count} .api=${this.api} .languages=${this.languages} .recipe=${n} .t=${t} uiLang=${this.lang} .units=${this._catalog.units}
        .ingredients=${this._catalog.ingredients} .newIngredients=${e.new_ingredients}
        .tags=${this._catalog.tags} .newTags=${e.new_tags} .suggestedTags=${e.suggested_tags}
        ?fixedLanguage=${!!(e.updates_id || e.parent_id)}></itadaki-editor>

      <div class="row actions">
        <button class="btn" ?disabled=${this._busy} @click=${this._save}>${t("save")}</button>
        <button class="btn quiet" ?disabled=${this._busy} @click=${this._discard}>${t("discard")}</button>
      </div>
      ${this._busy ? T`<itadaki-busy></itadaki-busy>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
    `;
	}
	_matchCard() {
		let e = this.t, t = () => this.renderRoot.querySelector("itadaki-editor");
		return T`<div class="card actions">
      <h2>${e("matchTitle", { n: this._unmatched })}</h2>
      <div class="muted">${e("matchExplain")} ${e(this.ai ? "matchHowAi" : "matchHowHand")}</div>
      <div class="row" style="margin-top:12px">
        ${this.ai ? T`<button class="btn" ?disabled=${this._busy} @click=${() => this._task = "structure"}>${e("structureAi")}</button>` : E}
        <button class="btn quiet" @click=${() => t().showUnmatched()}>${e("matchByHand")}</button>
      </div>
    </div>`;
	}
	_actions() {
		let e = this.t, t = this._entry;
		if (!this.ai || t?.status !== "ready") return E;
		let n = (e) => () => this._task = this._task === e ? void 0 : e;
		return T`
      ${it("tag", e("tagAi"), n("tag"), this._busy)}
      ${it("adapt", e("adaptAi"), n("adapt"), this._busy)}
    `;
	}
	_taskCard() {
		let e = this.t, t = this._task === "adapt", n = {
			adapt: e("adaptAi"),
			structure: e("structureAi"),
			tag: e("tagAi")
		}[this._task], r = {
			structure: e("matchExplain"),
			tag: e("tagAiExplain")
		}[this._task];
		return T`<itadaki-ai-run class="actions" .t=${e} cancellable ?noteRequired=${t} ?disabled=${this._busy}
      heading=${n} .standing=${this.instructions[this._task]}
      @run=${this._runTask} @cancel=${() => this._task = void 0}>
      ${r ? T`<div class="muted">${r}</div>` : E}
    </itadaki-ai-run>`;
	}
};
customElements.define("itadaki-draft", gi);
// src/views/edit.js
var _i = class extends D {
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
			yield_quantity: null,
			yield_unit_id: null,
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
			let [e, t, n, r] = await Promise.all([
				this.recipeId ? this.api.call("get_recipe", { recipe_id: this.recipeId }).then((e) => e.recipe) : this._blank(),
				Ke(this.api, "ingredients"),
				Ke(this.api, "units"),
				Ke(this.api, "recipe_tags")
			]);
			this._data = {
				recipe: e,
				ingredients: t,
				units: n,
				tags: r
			};
		} catch (e) {
			this._error = this.t.error(e);
		}
	}
	async _save() {
		let e = this.renderRoot.querySelector("itadaki-editor"), t = {
			recipe: e.value,
			updates_id: this.recipeId,
			new_ingredients: e.newIngredientsUsed,
			new_tags: e.newTagsUsed
		};
		this._busy = !0, this._error = void 0;
		try {
			let { recipe: e } = await this.api.call("apply_draft", { draft: t });
			A(this, this.recipeId ? { view: "back" } : {
				view: "recipe",
				id: e.id,
				replace: !0
			});
		} catch (e) {
			this._error = this.t.error(e);
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
        .units=${this._data.units} .tags=${this._data.tags} .t=${e} ?fixedLanguage=${!!this.recipeId}></itadaki-editor>
      <div class="row" style="margin:16px 0">
        <button class="btn" ?disabled=${this._busy} @click=${this._save}>${e("save")}</button>
        <button class="btn quiet" ?disabled=${this._busy}
          @click=${() => A(this, { view: "back" })}>
          ${e("cancel")}</button>
      </div>
      ${this._busy ? T`<itadaki-busy></itadaki-busy>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
    ` : this._error ? T`<div class="error">${this._error}</div>` : T`<itadaki-busy></itadaki-busy>`;
	}
};
customElements.define("itadaki-edit", _i);
// src/views/entry.js
var vi = [
	"mass",
	"volume",
	"count",
	"other"
], yi = [
	"metric",
	"us",
	"imperial",
	"japanese"
], bi = (e) => e === "" || e == null ? null : Number(e), xi = (e) => e.split(/[,、]/).map((e) => e.trim()).filter(Boolean), Si = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		languages: { attribute: !1 },
		kind: {},
		entry: { attribute: !1 },
		entries: { attribute: !1 },
		usedBy: { attribute: !1 },
		tags: { attribute: !1 },
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
				tags: [],
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
	get _catalog() {
		return Ge[this.kind];
	}
	_hasPlural(e) {
		return !this._catalog.tagKind && Qe(e);
	}
	async _createTag(e) {
		try {
			let { tag: t } = await this.api.call("upsert_tag", { tag: {
				kind: "ingredient",
				localized: { [this.lang]: {
					name: e,
					aliases: []
				} }
			} });
			this.dispatchEvent(new CustomEvent("tag-created", { detail: t })), this._set("tags", [...this._e.tags, t.id]);
		} catch (e) {
			this._error = this.t.error(e);
		}
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
			plural: this._hasPlural(e) && t.plural.trim() || null,
			aliases: xi(t.aliases)
		} : null])), n = Object.values(t).find(Boolean)?.name ?? "", { tagKind: r } = this._catalog, i = this.entry?.id ?? (r ? void 0 : ft(n, new Set(this.entries.map((e) => e.id))));
		if (r) return {
			id: i,
			localized: t,
			kind: r
		};
		if (!this._isUnit) return {
			id: i,
			localized: t,
			density: bi(e.density),
			tags: e.tags
		};
		let a = e.dimension;
		return {
			id: i,
			localized: t,
			dimension: a,
			factor: a === "other" ? null : bi(e.factor),
			systems: e.systems
		};
	}
	async _act(e) {
		this._busy = !0, this._error = void 0;
		try {
			await e(), this.dispatchEvent(new CustomEvent("changed"));
		} catch (e) {
			this._error = this.t.error(e);
		} finally {
			this._busy = !1;
		}
	}
	_save() {
		let [e, t] = this._catalog.upsert;
		this._act(() => this.api.call(e, { [t]: this._payload() }));
	}
	_delete() {
		let e = k(this.entry, this.lang), t = this.usedBy?.length ? this.t("confirmDeleteTag", {
			name: e,
			n: this.usedBy.length
		}) : this.t("confirmDeleteEntry", { name: e });
		if (!confirm(t)) return;
		let [n, r] = this._catalog.remove;
		this._act(() => this.api.call(n, { [r]: this.entry.id }));
	}
	_merge(e) {
		let t = this.entries.find((t) => t.id === e), n = {
			from: k(this.entry, this.lang),
			to: k(t, this.lang)
		};
		confirm(this.t("confirmMerge", n)) && this._act(() => this.api.call(this._catalog.merge, {
			source_id: this.entry.id,
			target_id: e
		}));
	}
	render() {
		let e = this.t, t = this._e, n = this.usedBy || [], { tagKind: r } = this._catalog, i = this.entry && (r || !n.length);
		return T`
      ${Object.entries(t.localized).map(([t, n]) => {
			let r = (e, r) => T`<div>
          <label>${r}</label>
          <itadaki-text .value=${n[e]} @input=${(n) => this._setName(t, e, n.target.value)}></itadaki-text>
        </div>`;
			return T`<div class="lang">
          <div class="lang-name">${e.langName(t)}</div>
          <div class="fields ${this._hasPlural(t) ? "" : "single"}">
            ${r("name", e("name"))}
            ${this._hasPlural(t) ? r("plural", e("plural")) : E}
            ${r("aliases", e("aliases"))}
          </div>
        </div>`;
		})}

      ${r ? E : this._measures(t)}

      ${n.length ? T`<label>${e(r === "ingredient" ? "usedByIngredients" : "usedBy", { n: n.length })}</label>
            <div class="row">
              ${n.map((e) => e.title ? T`<button class="chip" @click=${() => A(this, {
			view: "recipe",
			id: e.id
		})}>${e.title}</button>` : T`<span class="chip">${k(e, this.lang)}</span>`)}
            </div>` : E}

      <div class="row actions">
        <button class="btn" ?disabled=${this._busy} @click=${this._save}>${e("save")}</button>
        <button class="btn quiet" ?disabled=${this._busy} @click=${() => this.dispatchEvent(new CustomEvent("cancel"))}>${e("cancel")}</button>
        ${i ? T`<button class="btn danger" ?disabled=${this._busy} @click=${this._delete}>${e("delete")}</button>` : E}
      </div>

      ${this.entry ? T`<div class="merge">
            <label>${e("mergeInto")}</label>
            <itadaki-combo noCreate .entries=${this.entries.filter((e) => e.id !== this.entry.id)}
              .hint=${Je(this.lang, qe(this.languages, this.lang))} placeholder=${e("catalogSearch")}
              @pick=${(e) => this._merge(e.detail.id)}></itadaki-combo>
            <div class="muted" style="font-size:0.85rem;margin-top:6px">${e("mergeHint")}</div>
          </div>` : E}
      ${this._busy ? T`<itadaki-busy></itadaki-busy>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
    `;
	}
	_measures(e) {
		let t = this.t;
		return T`
      <div class="grid2">
        ${this._isUnit ? T`<div>
                <label>${t("dimension")}</label>
                <select @change=${(e) => this._set("dimension", e.target.value)}>
                  ${vi.map((n) => T`<option value=${n} ?selected=${n === e.dimension}>${t(`dim_${n}`)}</option>`)}
                </select>
              </div>
              ${e.dimension === "other" ? E : T`<div>
                    <label>${t("factor", { base: Ye[e.dimension] ?? t("items") })}</label>
                    <input type="number" step="any" .value=${e.factor ?? ""} @input=${(e) => this._set("factor", e.target.value)} />
                  </div>`}` : T`<div>
              <label>${t("density")}</label>
              <input type="number" step="any" .value=${e.density ?? ""} @input=${(e) => this._set("density", e.target.value)} />
            </div>`}
      </div>
      ${this._isUnit ? T`<label>${t("systems")}</label>
            <div class="row">
              ${yi.map((n) => T`<button class="chip ${e.systems.includes(n) ? "active" : ""}"
                  @click=${() => this._set("systems", e.systems.includes(n) ? e.systems.filter((e) => e !== n) : [...e.systems, n])}>
                  ${t(`sys_${n}`)}</button>`)}
            </div>` : E}
      ${this.kind === "ingredients" ? T`<label>${t("tags")}</label>
            <itadaki-tags .entries=${this.tags || []} .value=${e.tags} lang=${this.lang} .t=${t}
              placeholder=${t("tagSearch")} createLabel=${t("create")}
              @change=${(e) => this._set("tags", e.detail.value)} @create=${(e) => this._createTag(e.detail.name)}></itadaki-tags>` : E}
    `;
	}
};
customElements.define("itadaki-entry", Si);
// src/views/catalog.js
var Ci = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		lang: {},
		languages: { attribute: !1 },
		kind: {},
		_entries: { state: !0 },
		_usage: { state: !0 },
		_query: { state: !0 },
		_tags: { state: !0 },
		_tagFilter: { state: !0 },
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
      tbody tr { border-top: var(--it-row-rule); }
      tr.entry { cursor: pointer; }
      tr.entry:hover, tr.entry.open { background: var(--it-soft); }
      tr.form { border-top: none; }
      tr.form td { padding: 0 0 8px; }
      /* The table may scroll sideways; its form stays within the visible width. */
      .pinned { position: sticky; left: 20px; width: calc(100cqw - 40px); }
      .name { font-weight: 600; }
      .aliases { color: var(--it-muted); font-size: 0.9rem; min-width: 120px; }
      .num { white-space: nowrap; }
      .tag-filter { margin: -8px 0 20px; max-width: 480px; }
    `];
	connectedCallback() {
		super.connectedCallback(), this._query = "";
	}
	willUpdate(e) {
		e.has("kind") && (this._entries = void 0, this._tags = [], this._tagFilter = [], this._open = void 0, this._load());
	}
	get _isIngredient() {
		return this.kind === "ingredients";
	}
	async _load() {
		try {
			let [e, t, n] = await Promise.all([
				Ke(this.api, this.kind),
				this.api.call("catalog_usage"),
				this._isIngredient ? Ke(this.api, "ingredient_tags") : []
			]);
			this._entries = e.sort(Xe(this.lang)), this._usage = t[this.kind], this._tags = n.sort(Xe(this.lang)), this._error = void 0;
		} catch (e) {
			this._error = this.t.error(e);
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
      .entries=${this._entries} .usedBy=${e ? this._usage[e.id] : []} .tags=${this._tags}
      @tag-created=${(e) => this._tags = [...this._tags, e.detail].sort(Xe(this.lang))}
      @changed=${this._changed} @cancel=${() => this._open = void 0}></itadaki-entry>`;
	}
	_columns() {
		let e = this.t;
		if (this._isIngredient) {
			let t = new Map(this._tags.map((e) => [e.id, e])), n = (e) => e.tags.map((e) => t.has(e) ? k(t.get(e), this.lang) : e).join(", ");
			return {
				heads: [e("density"), e("tags")],
				cells: (e) => [e.density ?? "", n(e)]
			};
		}
		return this.kind === "units" ? {
			heads: [
				e("dimension"),
				e("size"),
				e("systems")
			],
			cells: (t) => [
				e(`dim_${t.dimension}`),
				t.factor == null ? "" : `${t.factor} ${Ye[t.dimension] ?? e("items")}`,
				t.systems.map((t) => e(`sys_${t}`)).join(", ")
			]
		} : {
			heads: [],
			cells: () => []
		};
	}
	render() {
		return T`<itadaki-page .t=${this.t} header=${this.t(this.kind)}>${this._content()}</itadaki-page>`;
	}
	_content() {
		let e = this.t, t = ut((this._entries || []).filter((e) => this._tagFilter.every((t) => e.tags.includes(t))), this._query, Infinity), n = this.languages.includes(this.lang) ? [this.lang, ...this.languages.filter((e) => e !== this.lang)] : this.languages, r = this._columns(), i = n.length * 2 + r.heads.length + 1;
		return T`
      <div class="tools">
        <itadaki-text .value=${this._query} placeholder=${e("catalogSearch")} @input=${(e) => this._query = e.target.value}></itadaki-text>
        <button class="btn" @click=${() => this._toggle("new")}>+ ${e("newEntry")}</button>
      </div>
      ${this._isIngredient && this._tags.length ? T`<itadaki-tags class="tag-filter" .entries=${this._tags} .value=${this._tagFilter} lang=${this.lang} .t=${e}
            placeholder=${e("tagFilter")} @change=${(e) => this._tagFilter = e.detail.value}></itadaki-tags>` : E}
      ${this._error ? T`<div class="error">${this._error}</div>` : E}
      ${this._open === "new" ? T`<div class="card" style="margin-bottom:16px;padding:20px">${this._form(null)}</div>` : E}
      ${this._entries ? T`<div class="card">
            <table>
              <thead>
                <tr>
                  ${n.map((t) => T`<th>${e.langName(t)}</th><th>${e("otherNames")}</th>`)}
                  ${r.heads.map((e) => T`<th>${e}</th>`)}
                  <th>${e(this.kind === "ingredient_tags" ? "ingredients" : "recipes")}</th>
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
customElements.define("itadaki-catalog", Ci);
// src/views/manage.js
var wi = [
	[{
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
	}],
	[{
		target: {
			view: "catalog",
			id: "recipe_tags"
		},
		key: "recipe_tags",
		icon: "tag"
	}, {
		target: {
			view: "catalog",
			id: "ingredient_tags"
		},
		key: "ingredient_tags",
		icon: "tag"
	}],
	[
		{
			target: { view: "languages" },
			key: "languages",
			icon: "translate"
		},
		{
			target: { view: "ai" },
			key: "ai",
			icon: "adapt"
		},
		{
			target: { view: "shopping" },
			key: "shoppingList",
			icon: "cart"
		}
	]
], Ti = class extends D {
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
          ${wi.map((t, n) => T`${n ? T`<hr />` : E}${t.map((t) => T`<button class="item" @click=${() => A(this, t.target)}>
                <span class="badge">${j(t.icon)}</span>
                <span class="name">${e(t.key)}</span>
                <span class="chevron">${j("chevron")}</span>
              </button>`)}`)}
        </div>
      </itadaki-page>
    `;
	}
};
customElements.define("itadaki-manage", Ti);
// src/views/languages.js
var Ei = class extends D {
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
      .lang { display: flex; align-items: center; gap: 12px; padding: 4px 0; border-bottom: var(--it-row-rule); }
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
			this._error = this.t.error(e);
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
                @click=${() => this._save(this.languages.filter((e) => e !== t))}>${j("close")}</button>
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
customElements.define("itadaki-languages", Ei);
// src/views/ai.js
var Di = [
	"extract",
	"structure",
	"translate",
	"adapt",
	"tag"
], Oi = [
	"schema",
	"json",
	"off"
], ki = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		_s: { state: !0 },
		_instructions: { state: !0 },
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
      details textarea { font-family: monospace; font-size: 0.85rem; }
      .section { margin-top: 24px; }
      .hint { font-size: 0.8rem; margin-top: 4px; word-break: break-all; }
      .actions { margin-top: 20px; }
    `];
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		try {
			let [e, t] = await Promise.all([this.api.call("get_ai_settings"), this.api.call("get_settings")]);
			this._instructions = t.instructions, this._show(e);
		} catch (e) {
			this._error = this.t.error(e);
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
			let [e, t] = await Promise.all([this.api.call("update_ai_settings", n), this.api.call("update_settings", { instructions: this._instructions })]);
			this._show(e), this._instructions = t.instructions, this._saved = !0;
			let r = {
				ai: e.enabled,
				instructions: t.instructions
			};
			this.dispatchEvent(new CustomEvent("settings-changed", {
				detail: r,
				bubbles: !0,
				composed: !0
			}));
		} catch (e) {
			this._error = this.t.error(e);
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

        <h2 class="section">${e("standing")}</h2>
        <div class="muted" style="font-size:0.85rem">${e("standingHint")}</div>
        ${Di.map((t) => T`<label>${e("instructionsFor", { action: e(`task_${t}`) })}</label>
            <textarea rows="2" .value=${this._instructions[t] || ""}
              @input=${(e) => (this._instructions = {
			...this._instructions,
			[t]: e.target.value
		}, this._saved = !1)}></textarea>`)}

        <details>
          <summary>${e("advanced")}</summary>
          <label>${e("jsonMode")}</label>
          <select @change=${(e) => this._set("structured_output", e.target.value)}>
            ${Oi.map((n) => T`<option value=${n} ?selected=${n === t.structured_output}>${e(`json_${n}`)}</option>`)}
          </select>
          <label>${e("extraBody")}</label>
          <textarea rows="3" .value=${this._extra} @input=${(e) => (this._extra = e.target.value, this._saved = !1)}></textarea>
          <div class="muted hint">${e("extraBodyHint")}</div>
          ${Di.map((n) => T`<label>${e("modelFor", { action: e(`task_${n}`) })}</label>
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
customElements.define("itadaki-ai", ki);
// src/views/shopping-settings.js
var Ai = class extends D {
	static properties = {
		api: { attribute: !1 },
		t: { attribute: !1 },
		_s: { state: !0 },
		_busy: { state: !0 },
		_error: { state: !0 },
		_saved: { state: !0 }
	};
	static styles = [O, o`
      .card { max-width: 640px; margin: 0 auto; }
    `];
	async connectedCallback() {
		super.connectedCallback();
		try {
			this._s = await this.api.call("get_shopping_settings");
		} catch (e) {
			this._error = this.t.error(e);
		}
	}
	async _save(e) {
		this._busy = !0, this._error = void 0, this._saved = !1;
		try {
			this._s = await this.api.call("update_shopping_settings", { list: e }), this._saved = !0;
		} catch (e) {
			this._error = this.t.error(e);
		} finally {
			this._busy = !1;
		}
	}
	render() {
		let e = this.t, t = this._s;
		return T`
      <itadaki-page .t=${e} header=${e("shoppingList")}>
        <div class="card">
          <div class="muted">${e("shoppingHint")}</div>
          ${t ? t.lists.length ? T`<label>${e("defaultList")}</label>
                  <select ?disabled=${this._busy} @change=${(e) => this._save(e.target.value)}>
                    ${t.lists.map((e) => T`<option value=${e.entity_id} ?selected=${e.entity_id === t.list}>${e.name}</option>`)}
                  </select>` : T`<div class="error">${e("noTodoLists")}</div>` : this._error ? E : T`<itadaki-busy></itadaki-busy>`}
          ${this._saved ? T`<div class="muted" style="margin-top:8px">${e("saved")}</div>` : E}
          ${this._error ? T`<div class="error">${this._error}</div>` : E}
        </div>
      </itadaki-page>
    `;
	}
};
customElements.define("itadaki-shopping-settings", Ai);
// src/main.js
var ji = /* @__PURE__ */ new Set([
	"manage",
	"languages",
	"catalog",
	"ai",
	"shopping"
]), Mi = class extends D {
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
			instructions: e.instructions,
			ai: t.enabled
		}).catch((e) => this._error = e));
	}
	get _prefix() {
		return this.route?.prefix ?? "/itadaki";
	}
	_navigate(e) {
		let { view: t, replace: n } = e.detail;
		t === "back" ? nt(this._prefix) : tt(this._prefix, e.detail, n);
	}
	render() {
		if (!this.hass) return E;
		let e = He(this.hass), t = Ue(e);
		return T`
      <div @navigate=${this._navigate} @settings-changed=${(e) => this._settings = {
			...this._settings,
			...e.detail
		}}>
        ${this._settings ? this._screen(et(this.route?.path), t, e) : T`<itadaki-page .t=${t} home ?narrow=${this.narrow}>
              ${this._error ? T`<div class="error">${t.error(this._error)}</div>` : E}
            </itadaki-page>`}
      </div>
    `;
	}
	_screen(e, t, n) {
		let { languages: r, instructions: i, ai: a } = this._settings, o = !!this.hass.user?.is_admin;
		switch (!o && ji.has(e.view) && (e = { view: "list" }), e.view) {
			case "recipe": return T`<itadaki-recipe .api=${this.api} .t=${t} lang=${n} .languages=${r} ?ai=${a} .instructions=${i} .recipeId=${e.id}></itadaki-recipe>`;
			case "add": return T`<itadaki-import .api=${this.api} .t=${t} ?ai=${a} .instructions=${i}></itadaki-import>`;
			case "new":
			case "edit": return T`<itadaki-edit .api=${this.api} .t=${t} lang=${n} .languages=${r} .recipeId=${e.id}></itadaki-edit>`;
			case "draft": return T`<itadaki-draft .api=${this.api} .t=${t} lang=${n} .languages=${r} ?ai=${a} .instructions=${i} .draftId=${e.id}></itadaki-draft>`;
			case "manage": return T`<itadaki-manage .t=${t}></itadaki-manage>`;
			case "languages": return T`<itadaki-languages .api=${this.api} .t=${t} .languages=${r}></itadaki-languages>`;
			case "ai": return T`<itadaki-ai .api=${this.api} .t=${t}></itadaki-ai>`;
			case "shopping": return T`<itadaki-shopping-settings .api=${this.api} .t=${t}></itadaki-shopping-settings>`;
			case "catalog": return T`<itadaki-catalog .api=${this.api} .t=${t} lang=${n} .languages=${r} kind=${e.id}></itadaki-catalog>`;
			default: return T`<itadaki-list .api=${this.api} .t=${t} lang=${n} ?narrow=${this.narrow} ?admin=${o}></itadaki-list>`;
		}
	}
};
customElements.define("itadaki-panel", Mi);
