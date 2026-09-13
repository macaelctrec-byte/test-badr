// ===============================================================
// إدارة المقالات والمدونة (Blog & Articles Manager)
// ===============================================================

import { 
    db, 
    collection, 
    onSnapshot, 
    query, 
    doc, 
    updateDoc, 
    addDoc, 
    deleteDoc, 
    Timestamp 
} from "./firebase-config.js";
import { isUserAdmin, onAdminStateChange } from "./auth.js";
import { showToast, escapeHTML, generateShortId } from "./utils.js";
import { renderArticleCardSkeleton } from "./skeleton.js";

let allArticles = [];

export function getAllArticles() {
    return allArticles;
}

export function renderArticleCard(article) {
    if (!article) return '';

    const isAdmin = isUserAdmin();
    const adminButtonsHTML = isAdmin ? `
        <div class="absolute top-3 left-3 z-30 flex gap-2">
            <button class="edit-article-btn p-2 bg-white/90 dark:bg-[#2c2f38]/90 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white shadow-md transition-colors" title="تعديل المقالة" data-article-id="${article.id}">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="delete-article-btn p-2 bg-white/90 dark:bg-[#2c2f38]/90 text-red-600 rounded-full hover:bg-red-600 hover:text-white shadow-md transition-colors" title="حذف المقالة" data-article-id="${article.id}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>` : '';

    let previewText = 'اضغط لمتابعة قراءة المقال...';
    if (Array.isArray(article.content) && article.content.length > 0) {
        const firstBlock = article.content.find(b => b.body);
        if (firstBlock) {
            previewText = firstBlock.body.substring(0, 140) + '...';
        } else if (article.content[0].title) {
            previewText = article.content[0].title;
        }
    } else if (typeof article.content === 'string') {
        previewText = (article.content.replace(/<[^>]+>/g, '').substring(0, 140) || 'اضغط لقراءة المزيد') + '...';
    }

    let dateStr = 'حديثاً';
    if (article.createdAt) {
        const d = article.createdAt.toDate ? article.createdAt.toDate() : new Date(article.createdAt);
        dateStr = d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    const imgUrl = article.imageUrl || 'https://placehold.co/600x400/202124/ffcd00?text=Macca+Blog';
    const aId = article.shortId || article.id;

    return `
    <article class="group bg-white dark:bg-[#202124] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full relative">
        <div class="relative h-56 overflow-hidden bg-gray-100 dark:bg-white/5">
            ${adminButtonsHTML}
            <a href="#blog/${aId}" class="block h-full w-full">
                <img class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                     src="${imgUrl}" 
                     onerror="this.src='https://placehold.co/600x400/202124/ffcd00?text=Image+Error'" 
                     alt="${escapeHTML(article.title)}" 
                     loading="lazy">
            </a>
            <span class="absolute top-4 right-4 z-20 px-3 py-1 bg-[#ffcd00]/95 text-gray-900 text-xs font-bold rounded-full shadow-md">
                نصائح ومعلومات
            </span>
        </div>

        <div class="p-6 flex-grow flex flex-col">
            <div class="flex items-center gap-3 text-xs text-gray-400 mb-3 font-medium">
                <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5 text-[#ffcd00]"></i> ${dateStr}</span>
                <span>•</span>
                <span class="flex items-center gap-1"><i data-lucide="user" class="w-3.5 h-3.5 text-[#ffcd00]"></i> فريق مكة</span>
            </div>

            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-[#ffcd00] transition-colors">
                <a href="#blog/${aId}">${escapeHTML(article.title)}</a>
            </h2>

            <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                ${escapeHTML(previewText)}
            </p>

            <div class="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <a href="#blog/${aId}" class="inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white hover:text-[#ffcd00] transition-colors">
                    <span>اقرأ المقال كاملاً</span>
                    <i data-lucide="arrow-left" class="w-4 h-4 transition-transform group-hover:-translate-x-1"></i>
                </a>
            </div>
        </div>
    </article>
    `;
}

export function renderArticles() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    if (allArticles.length === 0) {
        grid.innerHTML = '<p class="text-gray-400 col-span-full text-center py-12">لا توجد مقالات منشورة حالياً.</p>';
        return;
    }

    grid.innerHTML = allArticles.map(a => renderArticleCard(a)).join('');

    setupAdminArticleButtons();
    if (window.lucide) window.lucide.createIcons();
}

export function renderArticleDetails(articleId) {
    const article = allArticles.find(a => a.shortId === articleId || a.id === articleId);

    if (!article) {
        if (allArticles.length === 0) {
            const titleEl = document.getElementById('blog-post-title');
            if (titleEl) titleEl.textContent = "جاري تحميل المقالة...";
            return;
        }
        window.location.hash = '#blog';
        return;
    }

    const titleEl = document.getElementById('blog-post-title');
    const imageEl = document.getElementById('blog-post-image');
    const contentEl = document.getElementById('blog-post-content-wrapper');

    if (titleEl) titleEl.textContent = article.title;
    if (imageEl) {
        imageEl.src = article.imageUrl || 'https://placehold.co/1200x600/202124/ffcd00?text=Macca+Blog';
        imageEl.alt = article.title;
    }

    if (contentEl) {
        let html = '';
        if (Array.isArray(article.content)) {
            let paragraphCounter = 1;
            article.content.forEach(b => {
                if (b.type === 'paragraph') {
                    if (b.title) html += `<h2 class="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">${paragraphCounter++}. ${escapeHTML(b.title)}</h2>`;
                    if (b.body) {
                        const lines = b.body.split('\n').map(l => l.trim()).filter(Boolean);
                        if (lines.length > 0) {
                            html += '<ul class="list-disc pr-6 space-y-2 mb-4 text-gray-700 dark:text-gray-300">';
                            lines.forEach(line => { html += `<li>${escapeHTML(line)}</li>`; });
                            html += '</ul>';
                        }
                    }
                } else if (b.type === 'gallery' && b.images) {
                    html += '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">';
                    b.images.forEach(img => {
                        html += `<img src="${escapeHTML(img)}" class="w-full h-48 object-cover rounded-xl shadow-md">`;
                    });
                    html += '</div>';
                }
            });
        } else if (typeof article.content === 'string') {
            html = article.content;
        }

        contentEl.innerHTML = html || '<p>لا يتوفر محتوى للمقالة.</p>';
    }

    if (window.lucide) window.lucide.createIcons();
}

function setupAdminArticleButtons() {
    document.querySelectorAll('.delete-article-btn').forEach(btn => {
        if (btn.dataset.listenerAttached === 'true') return;
        btn.dataset.listenerAttached = 'true';

        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            const id = btn.dataset.articleId;
            if (confirm("هل تريد بالتأكيد حذف هذه المقالة؟")) {
                try {
                    await deleteDoc(doc(db, "articles", id));
                    showToast("تم حذف المقالة بنجاح.");
                } catch (err) {
                    console.error("Error deleting article:", err);
                    showToast("تعذر حذف المقالة: " + (err.message || "خطأ"));
                }
            }
        });
    });

    document.querySelectorAll('.edit-article-btn').forEach(btn => {
        if (btn.dataset.listenerAttached === 'true') return;
        btn.dataset.listenerAttached = 'true';

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const id = btn.dataset.articleId;
            const article = allArticles.find(a => a.id === id);
            if (article) openArticleModal(article);
        });
    });
}

export function openArticleModal(article = null) {
    const modal = document.getElementById('add-article-modal');
    const form = document.getElementById('add-article-form');
    const titleEl = document.getElementById('article-modal-title');
    const submitBtn = document.getElementById('article-modal-submit-btn');
    const container = document.getElementById('article-paragraphs-container');

    if (!modal || !form) return;

    if (article) {
        titleEl.textContent = "تعديل المقالة";
        submitBtn.textContent = "تحديث المقالة";
        form.dataset.editingId = article.id;

        document.getElementById('articleTitle').value = article.title || '';
        document.getElementById('articleImageUrl').value = article.imageUrl || '';

        if (container) {
            container.innerHTML = '';
            if (Array.isArray(article.content) && article.content.length > 0) {
                article.content.forEach(b => {
                    if (b.type === 'paragraph') addParagraphBlock(b.title, b.body);
                });
            } else {
                addParagraphBlock('', typeof article.content === 'string' ? article.content : '');
            }
        }
    } else {
        titleEl.textContent = "إضافة مقالة جديدة";
        submitBtn.textContent = "نشر المقالة";
        form.reset();
        delete form.dataset.editingId;
        if (container) {
            container.innerHTML = '';
            addParagraphBlock();
        }
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

export function addParagraphBlock(title = '', body = '') {
    const container = document.getElementById('article-paragraphs-container');
    if (!container) return;

    const block = document.createElement('div');
    block.className = 'content-block paragraph-block bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative';
    block.dataset.type = 'paragraph';

    block.innerHTML = `
        <button type="button" class="remove-block-btn absolute top-3 left-3 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
        <div class="mb-3">
            <label class="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">عنوان الفقرة (اختياري)</label>
            <input type="text" class="paragraph-title w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#333] border border-gray-200 dark:border-gray-600" value="${escapeHTML(title)}">
        </div>
        <div>
            <label class="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">نص الفقرة (نقاط أو فقرة كاملة)</label>
            <textarea class="paragraph-body w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#333] border border-gray-200 dark:border-gray-600" rows="3">${escapeHTML(body)}</textarea>
        </div>
    `;

    block.querySelector('.remove-block-btn').onclick = () => block.remove();
    container.appendChild(block);
    if (window.lucide) window.lucide.createIcons();
}

/**
 * ربط وتفعيل نموذج إضافة وتعديل المقالة
 */
export function initArticleForm() {
    const form = document.getElementById('add-article-form');
    const modal = document.getElementById('add-article-modal');
    const closeBtn = document.getElementById('close-add-article-modal-btn');
    const cancelBtn = document.getElementById('cancel-add-article-btn');

    const closeModal = () => {
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = '';
        }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('article-modal-submit-btn');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'نشر';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'جاري النشر...';
            }

            const editingId = form.dataset.editingId;

            const contentArray = [];
            document.querySelectorAll('#article-paragraphs-container .content-block').forEach(b => {
                if (b.dataset.type === 'paragraph') {
                    const title = b.querySelector('.paragraph-title')?.value.trim() || '';
                    const body = b.querySelector('.paragraph-body')?.value.trim() || '';
                    if (title || body) {
                        contentArray.push({ type: 'paragraph', title, body });
                    }
                }
            });

            const articleData = {
                title: document.getElementById('articleTitle')?.value.trim() || '',
                imageUrl: document.getElementById('articleImageUrl')?.value.trim() || '',
                content: contentArray
            };

            try {
                if (editingId) {
                    const articleRef = doc(db, "articles", editingId);
                    await updateDoc(articleRef, articleData);
                    showToast("تم تحديث المقالة بنجاح!");
                } else {
                    articleData.createdAt = Timestamp.now();
                    articleData.shortId = generateShortId(5);
                    await addDoc(collection(db, "articles"), articleData);
                    showToast("تم نشر المقالة الجديدة بنجاح!");
                }
                closeModal();
            } catch (error) {
                console.error("Error saving article:", error);
                showToast("خطأ أثناء حفظ المقالة: " + (error.message || ""));
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }
}

export function loadArticles() {
    initArticleForm();

    onAdminStateChange(() => {
        renderArticles();
    });

    if (allArticles.length === 0) {
        const grid = document.getElementById('blog-articles-grid');
        if (grid && !grid.children.length) {
            grid.innerHTML = renderArticleCardSkeleton(3);
        }
    }

    const cached = localStorage.getItem('macca_articles_cache_v2');
    if (cached) {
        try {
            allArticles = JSON.parse(cached);
            renderArticles();
        } catch (e) {}
    }

    const q = query(collection(db, "articles"));
    onSnapshot(q, (snapshot) => {
        allArticles = [];
        snapshot.forEach(d => {
            allArticles.push({ id: d.id, ...d.data() });
        });

        localStorage.setItem('macca_articles_cache_v2', JSON.stringify(allArticles));
        renderArticles();

        const hash = window.location.hash;
        if (hash.startsWith('#blog/')) {
            const rawId = decodeURIComponent(hash.substring('#blog/'.length)).replace(/\/$/, '').trim();
            renderArticleDetails(rawId);
        }
    }, (err) => {
        console.error("Error fetching articles:", err);
    });
}
