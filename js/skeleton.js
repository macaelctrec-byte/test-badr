// ===============================================================
// متجر مكة للأدوات الكهربائية | مكتبة الـ Skeleton Loading UI
// Reusable Design System Components for Zero-CLS Skeleton Loading
// ===============================================================

/**
 * 1. كروت المنتجات (Product Cards Skeleton)
 * يطابق تصميم أبعاد ونسب كروت المنتجات الحقيقية
 */
export function renderProductCardSkeleton(count = 4) {
    const cardHtml = `
        <div class="product-card-wrapper">
            <div class="product-card bg-white dark:bg-[#202124] rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden p-2.5 sm:p-3 flex flex-col h-full">
                <!-- صورة المنتج (نسبة 1:1) -->
                <div class="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden mb-3">
                    <div class="skeleton-shimmer skeleton-img w-full h-full"></div>
                    <!-- شارة العرض الوهمية -->
                    <div class="absolute top-2.5 right-2.5 w-14 h-5 rounded-full skeleton-shimmer"></div>
                    <!-- زر المفضلة -->
                    <div class="absolute top-2.5 left-2.5 w-8 h-8 rounded-full skeleton-shimmer"></div>
                </div>

                <!-- تفاصيل المنتج -->
                <div class="flex-grow flex flex-col">
                    <!-- الماركة والقسم -->
                    <div class="flex items-center justify-between mb-2">
                        <div class="w-16 h-3.5 rounded skeleton-shimmer"></div>
                        <div class="w-12 h-3.5 rounded skeleton-shimmer"></div>
                    </div>

                    <!-- اسم المنتج بسطرين -->
                    <div class="w-11/12 h-4 rounded skeleton-shimmer mb-1.5"></div>
                    <div class="w-3/4 h-4 rounded skeleton-shimmer mb-3"></div>

                    <!-- السعر وزر الشراء -->
                    <div class="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <div class="w-20 h-5 rounded skeleton-shimmer mb-1"></div>
                            <div class="w-12 h-3 rounded skeleton-shimmer"></div>
                        </div>
                        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl skeleton-shimmer"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return Array(count).fill(cardHtml).join('');
}

/**
 * 2. صفحة تفاصيل المنتج (Product Details Skeleton)
 * يطابق بنية ومعرض ومواصفات صفحة التفاصيل
 */
export function renderProductDetailsSkeleton() {
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- مسار التنقل Breadcrumbs -->
            <div class="flex items-center gap-2 mb-6">
                <div class="w-16 h-4 rounded skeleton-shimmer"></div>
                <div class="w-4 h-4 rounded skeleton-shimmer"></div>
                <div class="w-24 h-4 rounded skeleton-shimmer"></div>
                <div class="w-4 h-4 rounded skeleton-shimmer"></div>
                <div class="w-32 h-4 rounded skeleton-shimmer"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <!-- معرض الصور (5 أعمدة) -->
                <div class="lg:col-span-5 space-y-4">
                    <div class="aspect-square w-full rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5">
                        <div class="skeleton-shimmer w-full h-full"></div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-20 h-20 rounded-2xl skeleton-shimmer"></div>
                        <div class="w-20 h-20 rounded-2xl skeleton-shimmer"></div>
                        <div class="w-20 h-20 rounded-2xl skeleton-shimmer"></div>
                    </div>
                </div>

                <!-- بيانات المنتج والخيارات (7 أعمدة) -->
                <div class="lg:col-span-7 space-y-5">
                    <!-- الشارات والماركة -->
                    <div class="flex items-center gap-3">
                        <div class="w-24 h-6 rounded-full skeleton-shimmer"></div>
                        <div class="w-20 h-6 rounded-full skeleton-shimmer"></div>
                    </div>

                    <!-- العنوان -->
                    <div class="space-y-2">
                        <div class="w-5/6 h-7 rounded-xl skeleton-shimmer"></div>
                        <div class="w-2/3 h-7 rounded-xl skeleton-shimmer"></div>
                    </div>

                    <!-- كارت السعر والخصم -->
                    <div class="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div class="space-y-2">
                            <div class="w-28 h-7 rounded skeleton-shimmer"></div>
                            <div class="w-20 h-4 rounded skeleton-shimmer"></div>
                        </div>
                        <div class="w-24 h-8 rounded-full skeleton-shimmer"></div>
                    </div>

                    <!-- خيارات الألوان أو التحديد -->
                    <div class="space-y-2">
                        <div class="w-28 h-4 rounded skeleton-shimmer"></div>
                        <div class="flex gap-2">
                            <div class="w-8 h-8 rounded-full skeleton-shimmer"></div>
                            <div class="w-8 h-8 rounded-full skeleton-shimmer"></div>
                            <div class="w-8 h-8 rounded-full skeleton-shimmer"></div>
                        </div>
                    </div>

                    <!-- أزرار الإضافة للسلة والكمية -->
                    <div class="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <div class="w-full sm:w-36 h-14 rounded-2xl skeleton-shimmer"></div>
                        <div class="flex-grow h-14 rounded-2xl skeleton-shimmer"></div>
                    </div>

                    <!-- جدول المواصفات الفنية -->
                    <div class="pt-6 space-y-3">
                        <div class="w-32 h-5 rounded skeleton-shimmer mb-4"></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="h-12 rounded-xl skeleton-shimmer"></div>
                            <div class="h-12 rounded-xl skeleton-shimmer"></div>
                            <div class="h-12 rounded-xl skeleton-shimmer"></div>
                            <div class="h-12 rounded-xl skeleton-shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 3. عناصر سلة المشتريات (Cart Items Skeleton)
 */
export function renderCartItemsSkeleton(count = 3) {
    const itemHtml = `
        <div class="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
            <!-- صورة المنتج المصغرة -->
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl skeleton-shimmer flex-shrink-0"></div>

            <!-- اسم وتفاصيل المنتج -->
            <div class="flex-grow text-center sm:text-right space-y-2 w-full sm:w-auto">
                <div class="w-3/4 sm:w-48 h-5 rounded skeleton-shimmer mx-auto sm:mx-0"></div>
                <div class="w-24 h-3.5 rounded skeleton-shimmer mx-auto sm:mx-0"></div>
                <div class="w-20 h-4 rounded skeleton-shimmer mx-auto sm:mx-0"></div>
            </div>

            <!-- أزرار الكمية والإجمالي وحذف -->
            <div class="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div class="w-28 h-9 rounded-xl skeleton-shimmer"></div>
                <div class="w-20 h-6 rounded skeleton-shimmer"></div>
                <div class="w-8 h-8 rounded-xl skeleton-shimmer"></div>
            </div>
        </div>
    `;
    return Array(count).fill(itemHtml).join('');
}

/**
 * 4. ملخص إتمام الطلب (Checkout Summary Skeleton)
 */
export function renderCheckoutSummarySkeleton() {
    const miniItemsHtml = Array(3).fill(`
        <div class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <div class="w-12 h-12 rounded-lg skeleton-shimmer flex-shrink-0"></div>
            <div class="flex-grow space-y-1.5">
                <div class="w-32 h-3.5 rounded skeleton-shimmer"></div>
                <div class="w-16 h-3 rounded skeleton-shimmer"></div>
            </div>
            <div class="w-16 h-4 rounded skeleton-shimmer"></div>
        </div>
    `).join('');

    return `
        <div class="space-y-4">
            <div class="space-y-2.5">
                ${miniItemsHtml}
            </div>
            <div class="pt-4 border-t border-gray-100 dark:border-white/5 space-y-2.5 text-xs">
                <div class="flex justify-between items-center">
                    <div class="w-20 h-4 rounded skeleton-shimmer"></div>
                    <div class="w-16 h-4 rounded skeleton-shimmer"></div>
                </div>
                <div class="flex justify-between items-center">
                    <div class="w-24 h-4 rounded skeleton-shimmer"></div>
                    <div class="w-16 h-4 rounded skeleton-shimmer"></div>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/10">
                    <div class="w-24 h-5 rounded skeleton-shimmer"></div>
                    <div class="w-20 h-5 rounded skeleton-shimmer"></div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 5. هيكل تتبع الطلب والخط الزمني (Order Tracking Timeline & Details Skeleton)
 */
export function renderOrderTrackingSkeleton() {
    // 7 خطوات للخط الزمني
    const timelineStepsHtml = Array(7).fill(`
        <div class="tracking-step flex items-start gap-4">
            <div class="w-9 h-9 rounded-full skeleton-shimmer flex-shrink-0"></div>
            <div class="flex-grow space-y-1 pt-1">
                <div class="w-32 h-4 rounded skeleton-shimmer"></div>
                <div class="w-56 h-3 rounded skeleton-shimmer"></div>
                <div class="w-24 h-2.5 rounded skeleton-shimmer mt-1"></div>
            </div>
        </div>
    `).join('');

    return `
        <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#202124] border border-gray-100 dark:border-white/5 shadow-xl space-y-8">
            <!-- الهيدر: رقم الطلب وشارات الحالة -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <div class="space-y-2">
                    <div class="w-44 h-6 rounded-lg skeleton-shimmer"></div>
                    <div class="w-32 h-3.5 rounded skeleton-shimmer"></div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-24 h-8 rounded-full skeleton-shimmer"></div>
                    <div class="w-24 h-8 rounded-full skeleton-shimmer"></div>
                </div>
            </div>

            <!-- الخط الزمني للطلب (Timeline) -->
            <div class="space-y-4">
                <div class="w-36 h-5 rounded skeleton-shimmer mb-6"></div>
                <div class="space-y-6">
                    ${timelineStepsHtml}
                </div>
            </div>

            <!-- شبكة تفاصيل العميل والدفع -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-white/5">
                <!-- بيانات العميل والشحن -->
                <div class="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
                    <div class="w-32 h-4 rounded skeleton-shimmer mb-3"></div>
                    <div class="w-40 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="w-32 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="w-48 h-3.5 rounded skeleton-shimmer"></div>
                </div>

                <!-- بيانات الدفع وإثبات التحويل -->
                <div class="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
                    <div class="w-32 h-4 rounded skeleton-shimmer mb-3"></div>
                    <div class="w-36 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="w-28 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="h-28 w-full rounded-xl skeleton-shimmer mt-2"></div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 6. بطاقات إحصائيات لوحة التحكم (Admin Stats Cards Skeleton)
 */
export function renderAdminStatsSkeleton() {
    const cardHtml = `
        <div class="p-5 rounded-2xl bg-white dark:bg-[#202124] border border-gray-100 dark:border-white/5 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
                <div class="w-24 h-4 rounded skeleton-shimmer"></div>
                <div class="w-10 h-10 rounded-xl skeleton-shimmer"></div>
            </div>
            <div class="w-28 h-8 rounded-lg skeleton-shimmer"></div>
            <div class="w-36 h-3 rounded skeleton-shimmer"></div>
        </div>
    `;
    return Array(6).fill(cardHtml).join('');
}

/**
 * 7. أسطر جدول الطلبات في لوحة المشرف (Admin Orders Table Rows Skeleton)
 */
export function renderAdminOrdersTableSkeleton(rows = 6) {
    const rowHtml = `
        <tr class="border-b border-gray-100 dark:border-white/5">
            <td class="py-3.5 px-3"><div class="w-24 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-20 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-24 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-16 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-20 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-16 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-20 h-6 rounded-full skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-24 h-6 rounded-full skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-20 h-3.5 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3 text-center"><div class="w-16 h-7 rounded-lg skeleton-shimmer mx-auto"></div></td>
        </tr>
    `;
    return Array(rows).fill(rowHtml).join('');
}

/**
 * 8. كروت مقالات المدونة (Blog Article Cards Skeleton)
 */
export function renderArticleCardSkeleton(count = 3) {
    const cardHtml = `
        <article class="bg-white dark:bg-[#202124] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col h-full">
            <div class="h-56 w-full skeleton-shimmer relative">
                <div class="absolute top-4 right-4 w-20 h-6 rounded-full skeleton-shimmer"></div>
            </div>
            <div class="p-6 flex-grow flex flex-col space-y-3">
                <div class="flex items-center gap-3">
                    <div class="w-24 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="w-16 h-3.5 rounded skeleton-shimmer"></div>
                </div>
                <div class="w-5/6 h-6 rounded-lg skeleton-shimmer"></div>
                <div class="w-full h-4 rounded skeleton-shimmer"></div>
                <div class="w-4/5 h-4 rounded skeleton-shimmer"></div>
                <div class="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div class="w-28 h-4 rounded skeleton-shimmer"></div>
                    <div class="w-5 h-5 rounded-full skeleton-shimmer"></div>
                </div>
            </div>
        </article>
    `;
    return Array(count).fill(cardHtml).join('');
}

/**
 * 9. الشريط الإخباري العلوي (Top Notification Bar Skeleton)
 */
export function renderNotificationSkeleton() {
    return `<div class="w-48 h-3.5 rounded-full skeleton-shimmer mx-auto"></div>`;
}
