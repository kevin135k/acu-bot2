(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.AcuPrivateNotes = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'acu_bot2.private_notes.v1';
  const SCHEMA_VERSION = 1;

  const ERROR_CODES = Object.freeze({
    VALIDATION_EMPTY: 'VALIDATION_EMPTY',
    STORAGE_UNAVAILABLE: 'STORAGE_UNAVAILABLE',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    WRITE_FAILED: 'WRITE_FAILED',
    CORRUPT_DATA: 'CORRUPT_DATA',
    NOT_FOUND: 'NOT_FOUND',
    RESET_NOT_CONFIRMED: 'RESET_NOT_CONFIRMED'
  });

  const DANGEROUS_BLOCK_TAGS = [
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'svg',
    'math',
    'noscript',
    'template',
    'head',
    'title'
  ];

  const BLOCK_BREAK_TAGS = new Set([
    'div',
    'p',
    'li',
    'tr',
    'blockquote',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6'
  ]);

  function decodeBasicEntities(str) {
    return str
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/gi, ' ')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&');
  }

  function escapeHtmlText(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function stripDangerousBlocks(input) {
    let result = input;
    let prev;
    do {
      prev = result;
      result = result.replace(/<!--[\s\S]*?-->/g, '');
      for (let i = 0; i < DANGEROUS_BLOCK_TAGS.length; i++) {
        const tag = DANGEROUS_BLOCK_TAGS[i];
        const pairedRe = new RegExp('<' + tag + '\\b[^>]*>[\\s\\S]*?<\\/' + tag + '\\s*>', 'gi');
        result = result.replace(pairedRe, '');
      }
    } while (result !== prev);

    // Strip any unclosed dangerous block tags through end of string
    for (let i = 0; i < DANGEROUS_BLOCK_TAGS.length; i++) {
      const tag = DANGEROUS_BLOCK_TAGS[i];
      const unclosedRe = new RegExp('<' + tag + '\\b[^>]*>[\\s\\S]*$', 'gi');
      result = result.replace(unclosedRe, '');
    }

    return result;
  }

  /**
   * Whitelist HTML sanitizer for private notes.
   * Allowed tags ONLY: <strong> (normalized from <b>/<strong>), <u>, <br>.
   * Strips ALL HTML attributes and all other tags; strips script/style/iframe/etc. with inner content.
   */
  function sanitizeNoteHtml(raw) {
    if (typeof raw !== 'string' || raw.length === 0) {
      return '';
    }

    let cleaned = raw.replace(/\r\n?/g, '\n');
    cleaned = stripDangerousBlocks(cleaned);

    const tokenRe = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)([^>]*)>/g;
    const output = [];
    const openStack = [];
    let lastIndex = 0;
    let match;

    function pushText(segment) {
      if (!segment) return;
      const decoded = decodeBasicEntities(segment);
      const escaped = escapeHtmlText(decoded).replace(/\n/g, '<br>');
      output.push(escaped);
    }

    function openFormatTag(tagName) {
      if (openStack.indexOf(tagName) !== -1) {
        return;
      }
      openStack.push(tagName);
      output.push('<' + tagName + '>');
    }

    function closeFormatTag(tagName) {
      const idx = openStack.lastIndexOf(tagName);
      if (idx === -1) {
        return;
      }
      // Properly close nested tags above target, close target, then reopen nested tags
      const toReopen = [];
      for (let i = openStack.length - 1; i > idx; i--) {
        const t = openStack.pop();
        output.push('</' + t + '>');
        toReopen.unshift(t);
      }
      openStack.pop();
      output.push('</' + tagName + '>');
      for (let i = 0; i < toReopen.length; i++) {
        openStack.push(toReopen[i]);
        output.push('<' + toReopen[i] + '>');
      }
    }

    while ((match = tokenRe.exec(cleaned)) !== null) {
      if (match.index > lastIndex) {
        pushText(cleaned.slice(lastIndex, match.index));
      }

      const isClosing = match[1] === '/';
      const tagName = match[2].toLowerCase();

      if (tagName === 'b' || tagName === 'strong') {
        if (isClosing) {
          closeFormatTag('strong');
        } else {
          openFormatTag('strong');
        }
      } else if (tagName === 'u') {
        if (isClosing) {
          closeFormatTag('u');
        } else {
          openFormatTag('u');
        }
      } else if (tagName === 'br') {
        if (!isClosing) {
          output.push('<br>');
        }
      } else if (BLOCK_BREAK_TAGS.has(tagName)) {
        if (isClosing) {
          output.push('<br>');
        }
      }
      // All other tags and ALL attributes are discarded.

      lastIndex = tokenRe.lastIndex;
    }

    if (lastIndex < cleaned.length) {
      pushText(cleaned.slice(lastIndex));
    }

    while (openStack.length > 0) {
      const t = openStack.pop();
      output.push('</' + t + '>');
    }

    let html = output.join('');

    // Remove empty formatting pairs repeatedly
    let prevHtml;
    do {
      prevHtml = html;
      html = html.replace(/<strong><\/strong>/g, '').replace(/<u><\/u>/g, '');
    } while (html !== prevHtml);

    // Trim a single trailing <br> introduced by block closing tags like <div>text</div>
    html = html.replace(/(?:<br>)+$/g, function (trailing) {
      // Preserve intentional extra line breaks only if there were multiple in the middle;
      // trailing bare line breaks at end of note are trimmed.
      return '';
    });

    return html;
  }

  /**
   * Extract plain text from sanitized HTML for blank/whitespace validation and previews.
   */
  function extractPlainText(html) {
    const safe = sanitizeNoteHtml(html);
    const withNewlines = safe.replace(/<br>/g, '\n').replace(/<\/?(?:strong|u)>/g, '');
    return decodeBasicEntities(withNewlines);
  }

  /**
   * Returns true if the note content is empty or contains only whitespace/line breaks.
   */
  function isNoteContentEmpty(html) {
    const plain = extractPlainText(html);
    return plain.replace(/[\s\u00A0\u200B\uFEFF]/g, '').length === 0;
  }

  /**
   * Parse sanitized note HTML into a safe AST so React / DOM can render without
   * ever calling dangerouslySetInnerHTML or innerHTML.
   * Node types:
   *  - { type: 'text', value: string }
   *  - { type: 'br' }
   *  - { type: 'strong', children: Node[] }
   *  - { type: 'u', children: Node[] }
   */
  function parseSafeNoteToAst(inputHtml) {
    const safe = sanitizeNoteHtml(inputHtml);
    const root = { type: 'root', children: [] };
    const stack = [root];
    const tokenRe = /<(\/?)(strong|u|br)>/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRe.exec(safe)) !== null) {
      if (match.index > lastIndex) {
        const textVal = decodeBasicEntities(safe.slice(lastIndex, match.index));
        if (textVal.length > 0) {
          stack[stack.length - 1].children.push({ type: 'text', value: textVal });
        }
      }

      const isClosing = match[1] === '/';
      const tag = match[2];

      if (tag === 'br') {
        stack[stack.length - 1].children.push({ type: 'br' });
      } else if (!isClosing) {
        const node = { type: tag, children: [] };
        stack[stack.length - 1].children.push(node);
        stack.push(node);
      } else if (stack.length > 1 && stack[stack.length - 1].type === tag) {
        stack.pop();
      }

      lastIndex = tokenRe.lastIndex;
    }

    if (lastIndex < safe.length) {
      const tail = decodeBasicEntities(safe.slice(lastIndex));
      if (tail.length > 0) {
        stack[stack.length - 1].children.push({ type: 'text', value: tail });
      }
    }

    return root.children;
  }

  /**
   * Walk a contentEditable DOM element and serialize it into whitelist-sanitized HTML
   * without trusting innerHTML.
   */
  function serializeEditorElement(element) {
    if (!element || !element.childNodes) {
      return '';
    }

    function walkNodes(nodes) {
      let out = '';
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType === 3) {
          // TEXT_NODE
          out += escapeHtmlText(node.nodeValue || '').replace(/\n/g, '<br>');
        } else if (node.nodeType === 1) {
          // ELEMENT_NODE
          const tag = (node.tagName || '').toLowerCase();
          if (DANGEROUS_BLOCK_TAGS.indexOf(tag) !== -1) {
            continue;
          }
          if (tag === 'br') {
            out += '<br>';
            continue;
          }

          let inner = walkNodes(node.childNodes || []);

          let isBold = tag === 'strong' || tag === 'b';
          let isUnderline = tag === 'u';

          if (tag === 'span' && node.style) {
            const fw = String(node.style.fontWeight || '').toLowerCase();
            if (fw === 'bold' || fw === 'bolder' || (Number(fw) >= 600 && Number(fw) <= 900)) {
              isBold = true;
            }
            const td = String(node.style.textDecoration || node.style.textDecorationLine || '').toLowerCase();
            if (td.indexOf('underline') !== -1) {
              isUnderline = true;
            }
          }

          if (isUnderline) {
            inner = '<u>' + inner + '</u>';
          }
          if (isBold) {
            inner = '<strong>' + inner + '</strong>';
          }

          if (BLOCK_BREAK_TAGS.has(tag)) {
            // In contentEditable, <div><br></div> represents an empty line
            if (inner === '<br>') {
              out += '<br>';
            } else if (inner.length > 0) {
              out += (out.length > 0 && !out.endsWith('<br>') ? '<br>' : '') + inner + '<br>';
            }
          } else {
            out += inner;
          }
        }
      }
      return out;
    }

    return sanitizeNoteHtml(walkNodes(element.childNodes));
  }

  /**
   * Populate a DOM container from sanitized HTML using only createElement('strong'|'u'|'br')
   * and createTextNode (never uses innerHTML).
   */
  function renderAstIntoDom(container, html, doc) {
    const targetDoc = doc || (container && container.ownerDocument) || (typeof document !== 'undefined' ? document : null);
    if (!container || !targetDoc) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const ast = parseSafeNoteToAst(html);

    function appendNodes(parent, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.type === 'text') {
          parent.appendChild(targetDoc.createTextNode(n.value));
        } else if (n.type === 'br') {
          parent.appendChild(targetDoc.createElement('br'));
        } else if (n.type === 'strong' || n.type === 'u') {
          const el = targetDoc.createElement(n.type);
          appendNodes(el, n.children || []);
          parent.appendChild(el);
        }
      }
    }

    appendNodes(container, ast);
  }

  function defaultGenerateId() {
    const rand = Math.random().toString(36).slice(2, 10);
    return 'note_' + Date.now() + '_' + rand;
  }

  function sortNotesDesc(notes) {
    return notes.slice().sort(function (a, b) {
      if (a.updatedAt !== b.updatedAt) {
        return a.updatedAt < b.updatedAt ? 1 : -1;
      }
      if (a.createdAt !== b.createdAt) {
        return a.createdAt < b.createdAt ? 1 : -1;
      }
      return a.id < b.id ? 1 : -1;
    });
  }

  function isQuotaExceededError(err) {
    if (!err) return false;
    return (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014
    );
  }

  function isValidStoredNote(item) {
    return (
      item !== null &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      typeof item.id === 'string' &&
      item.id.trim().length > 0 &&
      typeof item.content === 'string' &&
      typeof item.createdAt === 'string' &&
      typeof item.updatedAt === 'string'
    );
  }

  /**
   * LocalStorage adapter implementing the NotesRepository interface:
   * - async list()
   * - async create({ content })
   * - async update(id, { content })
   * - async delete(id)
   * - async resetCorruptedData({ confirmed })
   *
   * Future cloud upgrade: swap this adapter with an ApiNotesRepository implementing
   * the same async interface without rewriting the UI layer.
   */
  class LocalStorageNotesRepository {
    constructor(options) {
      const opts = options || {};
      this.storageKey = opts.storageKey || STORAGE_KEY;
      this.now = typeof opts.now === 'function' ? opts.now : function () { return new Date().toISOString(); };
      this.generateId = typeof opts.generateId === 'function' ? opts.generateId : defaultGenerateId;
      this._storageOverride = Object.prototype.hasOwnProperty.call(opts, 'storage') ? opts.storage : undefined;
    }

    _getStorage() {
      if (this._storageOverride !== undefined) {
        return this._storageOverride;
      }
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
      } catch (e) {
        return null;
      }
      return null;
    }

    _readState() {
      const storage = this._getStorage();
      if (!storage || typeof storage.getItem !== 'function') {
        return {
          ok: false,
          notes: [],
          corrupted: false,
          error: {
            code: ERROR_CODES.STORAGE_UNAVAILABLE,
            message: '目前瀏覽器無法存取本機儲存空間（localStorage 可能已停用或受限）。'
          }
        };
      }

      let raw;
      try {
        raw = storage.getItem(this.storageKey);
      } catch (err) {
        return {
          ok: false,
          notes: [],
          corrupted: false,
          error: {
            code: ERROR_CODES.STORAGE_UNAVAILABLE,
            message: '讀取本機儲存空間失敗，請確認瀏覽器未封鎖網站資料存取。',
            cause: err
          }
        };
      }

      if (raw === null || raw === undefined || raw === '') {
        return { ok: true, notes: [], corrupted: false };
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        // CRITICAL: Never clear or overwrite raw corrupted data automatically.
        return {
          ok: false,
          notes: [],
          corrupted: true,
          rawPreserved: true,
          error: {
            code: ERROR_CODES.CORRUPT_DATA,
            message: '本機筆記資料格式受損，無法解析。為避免造成資料遺失，系統已保留原始資料且暫停寫入；請確認是否要重設受損資料。',
            cause: err
          }
        };
      }

      // Validate envelope schema: { version: 1, notes: [...] }
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed) ||
        !Array.isArray(parsed.notes)
      ) {
        return {
          ok: false,
          notes: [],
          corrupted: true,
          rawPreserved: true,
          error: {
            code: ERROR_CODES.CORRUPT_DATA,
            message: '本機筆記資料結構異常，無法讀取。為避免覆寫原始資料，系統已保留現有資料且暫停寫入。'
          }
        };
      }

      const normalized = [];
      for (let i = 0; i < parsed.notes.length; i++) {
        const item = parsed.notes[i];
        if (!isValidStoredNote(item)) {
          return {
            ok: false,
            notes: [],
            corrupted: true,
            rawPreserved: true,
            error: {
              code: ERROR_CODES.CORRUPT_DATA,
              message: '本機筆記中含異常項目，無法安全讀取。系統已保留原始資料且暫停寫入。'
            }
          };
        }
        normalized.push({
          id: item.id,
          content: sanitizeNoteHtml(item.content),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        });
      }

      return {
        ok: true,
        notes: sortNotesDesc(normalized),
        corrupted: false
      };
    }

    _writeNotes(notes) {
      const storage = this._getStorage();
      if (!storage || typeof storage.setItem !== 'function') {
        return {
          ok: false,
          error: {
            code: ERROR_CODES.STORAGE_UNAVAILABLE,
            message: '目前瀏覽器無法寫入本機儲存空間，您的編輯內容已保留。'
          }
        };
      }

      const sorted = sortNotesDesc(notes);
      const payload = JSON.stringify({
        version: SCHEMA_VERSION,
        notes: sorted
      });

      try {
        storage.setItem(this.storageKey, payload);
        return { ok: true, notes: sorted };
      } catch (err) {
        if (isQuotaExceededError(err)) {
          return {
            ok: false,
            error: {
              code: ERROR_CODES.QUOTA_EXCEEDED,
              message: '瀏覽器本機儲存空間已滿，無法儲存筆記。您的編輯內容已保留，請刪除部分舊筆記或清理空間後再試。',
              cause: err
            }
          };
        }
        return {
          ok: false,
          error: {
            code: ERROR_CODES.WRITE_FAILED,
            message: '無法寫入本機儲存空間（可能處於隱私瀏覽模式或權限受限）。您的編輯內容已保留。',
            cause: err
          }
        };
      }
    }

    async list() {
      return this._readState();
    }

    async create(input) {
      const state = this._readState();
      if (!state.ok) {
        return state;
      }

      const rawContent = input && typeof input.content === 'string' ? input.content : '';
      const sanitized = sanitizeNoteHtml(rawContent);
      if (isNoteContentEmpty(sanitized)) {
        return {
          ok: false,
          error: {
            code: ERROR_CODES.VALIDATION_EMPTY,
            message: '筆記內容不可為空白，請輸入文字後再儲存。'
          }
        };
      }

      const timestamp = this.now();
      const newNote = {
        id: this.generateId(),
        content: sanitized,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const nextNotes = [newNote].concat(state.notes);
      const writeRes = this._writeNotes(nextNotes);
      if (!writeRes.ok) {
        return writeRes;
      }

      return {
        ok: true,
        note: newNote,
        notes: writeRes.notes
      };
    }

    async update(id, input) {
      const state = this._readState();
      if (!state.ok) {
        return state;
      }

      const rawContent = input && typeof input.content === 'string' ? input.content : '';
      const sanitized = sanitizeNoteHtml(rawContent);
      if (isNoteContentEmpty(sanitized)) {
        return {
          ok: false,
          error: {
            code: ERROR_CODES.VALIDATION_EMPTY,
            message: '筆記內容不可為空白，請輸入文字後再儲存。'
          }
        };
      }

      const idx = state.notes.findIndex(function (n) { return n.id === id; });
      if (idx === -1) {
        return {
          ok: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: '找不到要更新的筆記，可能已被刪除。'
          }
        };
      }

      const existing = state.notes[idx];
      const updatedNote = {
        id: existing.id,
        content: sanitized,
        createdAt: existing.createdAt,
        updatedAt: this.now()
      };

      const nextNotes = state.notes.slice();
      nextNotes[idx] = updatedNote;

      const writeRes = this._writeNotes(nextNotes);
      if (!writeRes.ok) {
        return writeRes;
      }

      return {
        ok: true,
        note: updatedNote,
        notes: writeRes.notes
      };
    }

    async delete(id) {
      const state = this._readState();
      if (!state.ok) {
        return state;
      }

      const exists = state.notes.some(function (n) { return n.id === id; });
      if (!exists) {
        return {
          ok: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: '找不到要刪除的筆記。'
          }
        };
      }

      const nextNotes = state.notes.filter(function (n) { return n.id !== id; });
      const writeRes = this._writeNotes(nextNotes);
      if (!writeRes.ok) {
        return writeRes;
      }

      return {
        ok: true,
        deletedId: id,
        notes: writeRes.notes
      };
    }

    async resetCorruptedData(options) {
      const confirmed = Boolean(options && options.confirmed === true);
      if (!confirmed) {
        return {
          ok: false,
          error: {
            code: ERROR_CODES.RESET_NOT_CONFIRMED,
            message: '必須明確二次確認後才能清除受損資料。'
          }
        };
      }

      const storage = this._getStorage();
      if (!storage || typeof storage.removeItem !== 'function') {
        return {
          ok: false,
          error: {
            code: ERROR_CODES.STORAGE_UNAVAILABLE,
            message: '目前瀏覽器無法存取本機儲存空間，無法執行重設。'
          }
        };
      }

      try {
        storage.removeItem(this.storageKey);
        return { ok: true, notes: [], corrupted: false };
      } catch (err) {
        return {
          ok: false,
          error: {
            code: ERROR_CODES.WRITE_FAILED,
            message: '清除受損資料失敗，請檢查瀏覽器儲存權限。',
            cause: err
          }
        };
      }
    }
  }

  function createLocalNotesRepository(options) {
    return new LocalStorageNotesRepository(options);
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    SCHEMA_VERSION: SCHEMA_VERSION,
    ERROR_CODES: ERROR_CODES,
    sanitizeNoteHtml: sanitizeNoteHtml,
    extractPlainText: extractPlainText,
    isNoteContentEmpty: isNoteContentEmpty,
    parseSafeNoteToAst: parseSafeNoteToAst,
    serializeEditorElement: serializeEditorElement,
    renderAstIntoDom: renderAstIntoDom,
    sortNotesDesc: sortNotesDesc,
    LocalStorageNotesRepository: LocalStorageNotesRepository,
    createLocalNotesRepository: createLocalNotesRepository
  };
});
