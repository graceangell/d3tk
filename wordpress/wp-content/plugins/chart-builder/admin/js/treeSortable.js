/**
 * Tree sortable jQuery library using jQuery UI sortable.
 *
 * @package TreeSortable
 * @license MIT
 * @author Sajeeb Ahamed <sajeeb07ahamed@gmail.com>
 */

 const $ = jQuery;

 const getCenterPosition = element => {
     const { top, left, width, height } = element.getBoundingClientRect();
 
     return {
         x: left + width / 2,
         y: top + height / 2,
     };
 };

 const getDistance = (elementA, elementB) => {
     const positionA = getCenterPosition(elementA);
     const positionB = getCenterPosition(elementB);
 
     const distanceX = Math.floor(Math.abs(positionA.x - positionB.x));
     const distanceY = Math.floor(Math.abs(positionA.y - positionB.y));
 
     return { distanceX, distanceY };
 };
 
 function TreeSortable(options) {
     this.cssVarPrefix = 'tree-sortable';
     this.defaults = {
         depth: 30,
         treeSelector: '#tree',
         branchSelector: '.tree-branch',
         branchPathSelector: '.branch-path',
         dragHandlerSelector: '.branch-drag-handler',
         placeholderName: 'sortable-placeholder',
         childrenBusSelector: '.children-bus',
         levelPrefix: 'branch-level',
         maxLevel: 100,
         dataAttributes: {
             id: 'id',
             parent: 'parent',
             level: 'level',
         },
     };
 
     this.options = { ...this.defaults, ...options };
 
     const self = this;
 
     this.run = function () {
         this.jQuerySupplements();
         this.initSorting();
         this.addCSSVars();
         this.branchesLeftShifting();
     };
 
     this.addCSSVars = function () {
         const variables = {
             depth: { value: self.options.depth, unit: 'px' },
         };
 
         const root = $(self.options.treeSelector);
 
         for (const name in variables) {
             const value = variables[name];
             root.get(0).style.setProperty(`--${self.cssVarPrefix}-${name}`, `${value.value}${value.unit || ''}`);
         }
     };
 
     this.addBranchLeftShift = function ($element) {
         const { depth } = self.options;
         const level = Number($element.data('level')) || 1;
 
         $element.get(0).style.setProperty(`--${self.cssVarPrefix}-branch-left-shift`, `${depth * (level - 1)}px`);
         $element.get(0).style.setProperty(`--${self.cssVarPrefix}-children-left-shift`, `-${depth * (level - 1)}px`);
     };
 
     this.branchesLeftShifting = function () {
         const $elements = $(`${self.options.treeSelector} ${self.options.branchSelector}`);
         $elements.each(function () {
             self.addBranchLeftShift($(this));
         });
     };
 
     this.cleanSelector = function (selector) {
         return selector.replace(/^[\.#]/g, '');
     };
 
     this.getInstance = function () {
         return this;
     };
 
     this.getTreeEdge = function () {
         return $(this.options.treeSelector).offset().left;
     };
     this.pxToNumber = function (str) {
         return new RegExp('px$', 'i').test(str) ? str.slice(0, -2) * 1 : 0;
     };
     this.numberToPx = function (num) {
         return `${num}px`;
     };
     this.onSortCompleted = function (callback) {
         $(this.options.treeSelector).on('sortCompleted', callback);
     };
 
     this.generateUUID = function () {
         return 'xxxxxxxx-xxx'.replace(/[xy]/g, function (c) {
             var r = (Math.random() * 16) | 0,
                 v = c == 'x' ? r : (r & 0x3) | 0x8;
             return v.toString(16);
         });
     };
     this.createBranch = function ({ id, parent_id, title, level, description = "", image = "", tooltip = "", url = "", parent_name }) {
         const {
             branchSelector,
             branchPathSelector,
             dragHandlerSelector,
             childrenBusSelector,
             levelPrefix,
             dataAttributes: { id: idAttr, parent: parentAttr, level: levelAttr },
         } = self.options;

         if (typeof parent_name == "undefined") {
            parent_name = $(".tree-branch[data-id=" + parent_id + "]").find(".ays-chart-org-chart-name-" + parent_id).val();
         }

         var buttons = `<button type="button" class="button add-child" data-tippy-content="Add a new child">
                            <i class="fa fa-plus-circle"></i>
                        </button>`;
         if (id != 1) {
            buttons += `<button type="button" class="button add-sibling" data-tippy-content="Add a new sibling">
                            <i class="fa fa-plus-square"></i>
                        </button>
                        <button type="button" class="button remove-branch" data-tippy-content="Remove Branch">
                            <i class="fa fa-trash"></i>
                        </button>`;
         }
         buttons += `<button type="button" class="button open-branch-options" data-tippy-content="Change options" data-source-id=${id}>
                        <i class="fa fa-caret-down"></i>
                     </button>`;

         return `
         <li class="${self.cleanSelector(
             branchSelector
         )} ${levelPrefix}-${level}" data-${idAttr}="${id}" data-${parentAttr}="${parent_id}" data-${levelAttr}="${level}">
             <div class="contents">
                 <span class="${self.cleanSelector(branchPathSelector)}"></span>
                 <div class="branch-wrapper">
                    <div class="sidebars">
                        <div class="left-sidebar">
                            <div class="${self.cleanSelector(dragHandlerSelector)}">
                                <i class="fa fa-arrows"></i>
                            </div>
                            <span class="branch-title">${title}</span>
                        </div>
                        <div class="right-sidebar">${buttons}</div>
                    </div>
                    <input type="hidden" name="ays_chart_source_data_org_type[id_${id}][]" class="ays-chart-org-chart-name-${id}" value="${title}">
                    <input type="hidden" name="ays_chart_source_data_org_type[id_${id}][]" class="ays-chart-org-chart-description-${id}" value="${description}">
                    <input type="hidden" name="ays_chart_source_data_org_type[id_${id}][]" class="ays-chart-org-chart-image-${id}" value="${image}">
                    <input type="hidden" name="ays_chart_source_data_org_type[id_${id}][]" class="ays-chart-org-chart-parent-name" value="${parent_name}">
                    <input type="hidden" name="ays_chart_source_data_org_type[id_${id}][]" class="ays-chart-org-chart-tooltip-${id}" value="${tooltip}">
                    <input type="hidden" name="ays_chart_source_data_org_type[id_${id}][]" class="ays-chart-org-chart-url-${id}" value="${url}">
                    <input type="hidden" name="ays_chart_source_data_org_type[id_${id}][]" class="ays-chart-org-chart-parent" value="${parent_id}">
                    <input type="hidden" name="ays_chart_source_data_org_type[id_${id}][]" class="ays-chart-org-chart-level" value="${level}">
                 </div>
             </div>
             <div class="${self.cleanSelector(childrenBusSelector)}"></div>
         </li>
     `;
     };
 
     this.addListener = function (event, selector, callback) {
         $(document).on(event, `${self.options.treeSelector} ${selector}`, function (e) {
             callback(e, self);
         });
     };
 
     this.jQuerySupplements = function () {
         const { levelPrefix, dataAttributes } = self.options;
         $.fn.extend({
             getBranchLevel() {
                 return Number($(this).data('level')) || 0;
             },
             updateBranchLevel(current, prev = null) {
                 return this.each(function () {
                     prev = prev || $(this).getBranchLevel() || 1;
                     $(this)
                         .removeClass(levelPrefix + '-' + prev)
                         .addClass(levelPrefix + '-' + current)
                         .data(dataAttributes.level, current)
                         .attr(`data-${dataAttributes.level}`, current)
                         .find($(".ays-chart-org-chart-level")).val(current);
                     self.addBranchLeftShift($(this));
                 });
             },
             shiftBranchLevel(dx) {
                 return this.each(function () {
                     let level = $(this).getBranchLevel() || 1,
                         newLevel = level + dx;
 
                     $(this)
                         .removeClass(levelPrefix + '-' + level)
                         .addClass(levelPrefix + '-' + newLevel)
                         .data(dataAttributes.level, newLevel)
                         .attr(`data-${dataAttributes.level}`, newLevel)
                         .find($(".ays-chart-org-chart-level")).val(newLevel);
                     self.addBranchLeftShift($(this));
                 });
             },
             getParent() {
                 const { branchSelector } = self.options;
                 const level = $(this).getBranchLevel() || 1;
                 let $prev = $(this).prev(branchSelector);
 
                 while ($prev.length && $prev.getBranchLevel() >= level) {
                     $prev = $prev.prev(branchSelector);
                 }
 
                 return $prev;
             },
             getRootChild() {
                 const { branchSelector, treeSelector, levelPrefix } = self.options;
 
                 return $(treeSelector).children(`${branchSelector}.${levelPrefix}-1`);
             },
             getLastChild() {
                 const { branchSelector, treeSelector, levelPrefix } = self.options;
                 const $children = $(this).getChildren();
                 const $descendants = $(this).getDescendants();
                 const $lastChild = $descendants.length > $children.length ? $descendants.last() : $children.last();
 
                 return $lastChild.length ? $lastChild : $();
             },
             getChildren() {
                 const { branchSelector } = self.options;
                 let $children = $();
 
                 this.each(function () {
                     let level = $(this).getBranchLevel() || 1,
                         $next = $(this).next(branchSelector);
 
                     while ($next.length && $next.getBranchLevel() > level) {
                         if ($next.getBranchLevel() === level + 1) {
                             $children = $children.add($next);
                         }
                         $next = $next.next(branchSelector);
                     }
                 });
 
                 return $children;
             },
             getDescendants() {
                 const { branchSelector } = self.options;
                 let $descendants = $();
 
                 this.each(function () {
                     let level = $(this).getBranchLevel() || 1,
                         $next = $(this).next(branchSelector);
 
                     while ($next.length && $next.getBranchLevel() > level) {
                         $descendants = $descendants.add($next);
                         $next = $next.next(branchSelector);
                     }
                 });
 
                 return $descendants;
             },
             nextBranch() {
                 return $(this).next();
             },
             prevBranch() {
                 return $(this).prev();
             },
             nextSibling() {
                 const { branchSelector } = self.options;
 
                 let level = $(this).getBranchLevel() || 1,
                     $next = $(this).next(branchSelector),
                     nextLevel = $next.getBranchLevel();
 
                 while ($next.length && nextLevel > level) {
                     $next = $next.next(branchSelector);
                     nextLevel = $next.getBranchLevel();
                 }
 
                 return +nextLevel === +level ? $next : $();
             },
             prevSibling() {
                 const { branchSelector } = self.options;
                 let level = $(this).getBranchLevel() || 1,
                     $prev = $(this).prev(branchSelector),
                     prevLevel = $prev.getBranchLevel();
 
                 while ($prev.length && prevLevel > level) {
                     $prev = $prev.prev(branchSelector);
                     prevLevel = $prev.getBranchLevel();
                 }
 
                 return prevLevel === level ? $prev : $();
             },
             getLastSibling() {
                 let $nextSibling = $(this).nextSibling();
 
                 if (!$nextSibling.length) {
                     return $(this);
                 }
 
                 while ($nextSibling.length) {
                     $temp = $nextSibling.nextSibling();
 
                     if ($temp.length) {
                         $nextSibling = $temp;
                     } else {
                         return $nextSibling;
                     }
                 }
             },
             getSiblings(level = null) {
                 const { treeSelector, branchSelector } = self.options;
                 level = level || $(this).getBranchLevel();
 
                 let $siblings = [],
                     $branches = $(`${treeSelector} > ${branchSelector}`),
                     $self = this;
 
                 $branches.length &&
                     $branches.each(function () {
                         let branchLevel = $(this).getBranchLevel();
 
                         if (+branchLevel === +level && $self[0] !== $(this)[0]) {
                             $siblings.push($(this));
                         }
                     });
 
                 return $siblings;
             },
             calculateSiblingDistances() {
                 const { branchSelector, branchPathSelector } = self.options;
 
                 $(branchSelector).each(function () {
                     const level = $(this).getBranchLevel() || 1;
                     $(this).find(branchPathSelector).show();
 
                     if (typeof $(this).nextSibling !== 'function') return;
 
                     if (level > 1) {
                         const $sibling = $(this).nextSibling();
 
                         /**
                          * If next sibling (siblings with same branch level) exists then
                          * calculate the distance between two siblings and set the path
                          * height according to the distance.
                          */
                         if ($sibling.length) {
                             const distance = getDistance($(this).get(0), $sibling.get(0));
                             const thisParent = $(this).getParent() || $(this).getRootChild();
                             const parentDistance = getDistance($(this).get(0), thisParent.get(0));
 
                             $sibling
                                 .find(branchPathSelector)
                                 .css('height', `${Math.max(distance.distanceY + 8, 55)}px`);
                             $(this)
                                 .find(branchPathSelector)
                                 .css('height', `${Math.max(parentDistance.distanceY + 8, 55)}px`);
                         } else {
                             /**
                              * If no sibling exists to a branch then find the child.
                              * If child exists then set the child height as the default 55px.
                              */
                             const $nextBranch = $(this).next(branchSelector);
                             const nextBranchLevel = $nextBranch.getBranchLevel() || 1;
 
                             const isChild = $nextBranch.length > 0 && nextBranchLevel > level;
 
                             if (isChild) {
                                 $nextBranch.find(branchPathSelector).css('height', '55px');
                             }
 
                             if ($nextBranch.length > 0 && nextBranchLevel < level) {
                                 if ($(this).prevBranch().getBranchLevel() <= level) {
                                     $(this).find(branchPathSelector).css('height', '72px');
                                 }
                             }
 
                             if ($(this).prevBranch().getBranchLevel() < level) {
                                 $(this).find(branchPathSelector).css('height', '72px');
                             }
                         }
                     } else {
                         $(this).find(branchPathSelector).hide();
                     }
                 });
             },
             detectManualChange() {
                 var input = $(document).find('input[name="ays_source_type"]');
                 if (input.val() !== 'manual') {
                     input.val('manual');
                 } 	
             }
         });
     };
 
     this.addChildBranch = function ($triggerElement, treeDataSource) {
         const {
             treeSelector,
             branchSelector,
             dataAttributes: { id },
             maxLevel,
         } = self.options;
         $branch = $triggerElement.closest(`${treeSelector} ${branchSelector}`);
 
         if (!$branch.length) {
             throw Error('Invalid selector! Make sure that your add child button is inside a branch.');
         }
 
         const uid = treeDataSource.length + 1;
         const parent_id = $branch.data(id);
         const level = Math.min(maxLevel, parseInt($branch.getBranchLevel()) + 1);
         const title = 'New Branch ' + uid;
 
         $lastChild = $branch.getLastChild();
 
         const $element = self.createBranch({ id: uid, parent_id, title, level });
 
         if ($lastChild.length) {
             $lastChild.after($element);
         } else {
             $branch.after($element);
         }
 
         $(treeSelector).detectManualChange();
         $(treeSelector).calculateSiblingDistances();
         self.updateBranchZIndex();
         self.branchesLeftShifting();

         treeDataSource.push({
            id: uid,
            parent_id: parent_id,
            title: title,
            level: level
        })
     };
 
     this.addSiblingBranch = function ($triggerElement, treeDataSource) {
         const {
             treeSelector,
             branchSelector,
             dataAttributes: { parent },
         } = self.options;
 
         const $branch = $triggerElement.closest(`${treeSelector} ${branchSelector}`);
         const uid = treeDataSource.length + 1;
         const parent_id = $branch.data(parent);
         const level = $branch.getBranchLevel();
         const title = 'New Branch ' + uid;
         const $lastSibling = $branch.getLastSibling();
         let $lastChild = $lastSibling.getLastChild();
 
         while ($lastChild.length) {
             $temp = $lastChild.getLastChild();
 
             if ($temp.length) {
                 $lastChild = $temp;
             } else {
                 break;
             }
         }
 
         const $element = self.createBranch({ id: uid, parent_id, level, title });
 
         if ($lastChild.length) {
             $lastChild.after($element);
         } else {
             $lastSibling.after($element);
         }
 
         $(treeSelector).detectManualChange();
         $(treeSelector).calculateSiblingDistances();
         self.updateBranchZIndex();
         self.branchesLeftShifting();

         treeDataSource.push({
            id: uid,
            parent_id: parent_id,
            title: title,
            level: level
        })
     };
 
     this.removeBranch = function ($triggerElement) {
         const { treeSelector, branchSelector } = self.options;
 
         const $branch = $triggerElement.closest(`${treeSelector} ${branchSelector}`);
         $descendants = $branch.getDescendants();
 
         $descendants.each((_, element) => {
             $(element).remove();
         });
 
         $branch.remove();
         $(treeSelector).detectManualChange();
         self.updateBranchZIndex();
         self.branchesLeftShifting();
         $(treeSelector).calculateSiblingDistances();
     };

     this.openBranchOptions = function ($triggerElement) {
        var currentBranchWrapper = $triggerElement.parents(".branch-wrapper");

        var openCloseButton = $triggerElement.parent();
        var openCloseIcon =$triggerElement;
        if (!$triggerElement.hasClass("fa")) {
            var openCloseButton = $triggerElement;
            var openCloseIcon = openCloseButton.children();
        }

        var currentBranchId = openCloseButton.attr("data-source-id");
            var branchNameInpValue = currentBranchWrapper.find(".ays-chart-org-chart-name-" + currentBranchId).val();
            var branchDescriptionInpValue = currentBranchWrapper.find(".ays-chart-org-chart-description-" + currentBranchId).val();
            var branchImageInpValue = currentBranchWrapper.find(".ays-chart-org-chart-image-" + currentBranchId).val();
            var branchImageText = branchImageInpValue == '' ? aysChartBuilderAdmin.addImage : aysChartBuilderAdmin.editImage;
            var branchTooltipInpValue = currentBranchWrapper.find(".ays-chart-org-chart-tooltip-" + currentBranchId).val();
            var branchUrlInpValue = currentBranchWrapper.find(".ays-chart-org-chart-url-" + currentBranchId).val();

            var branchOptions = `
            <div class="ays-chart-org-chart-manual-branch-options-container">
                <div class="ays-chart-org-chart-manual-branch-options-left-box">
                    <div class="ays-chart-org-chart-branch-main-options-box">
                        <label for="ays-chart-org-chart-branch-name">Name:</label>
                        <input type="text" id="ays-chart-org-chart-branch-name" name="ays-chart-org-chart-branch-name" placeholder="Name" value="${branchNameInpValue}">
                    </div>
                    <div class="ays-chart-org-chart-branch-main-options-box">
                        <label for="ays-chart-org-chart-branch-description">Description:</label>
                        <input type="text" id="ays-chart-org-chart-branch-description" name="ays-chart-org-chart-branch-description" placeholder="Description" value="${branchDescriptionInpValue}">
                    </div>`;
                    // <div class="ays-chart-org-chart-branch-main-options-box">
                    //     <label for="ays-chart-org-chart-branch-image">Image:</label>
                    //     <button id="ays-chart-org-chart-branch-image" class="button ays-chart-select-org-img" type="button">${branchImageText}</button>
                    //     <input type="hidden" id="ays-chart-org-chart-branch-image-url" value="${branchImageInpValue}"> 
                    // </div>
            branchOptions += `<div class="ays-chart-org-chart-branch-main-options-box">
                        <label for="ays-chart-org-chart-branch-tooltip">Tooltip:</label>
                        <input type="text" id="ays-chart-org-chart-branch-tooltip" name="ays-chart-org-chart-branch-tooltip" placeholder="Tooltip" value="${branchTooltipInpValue}">
                    </div>
                    <div class="ays-chart-org-chart-branch-main-options-box">
                        <label for="ays-chart-org-chart-branch-url">Url:</label>
                        <input type="text" id="ays-chart-org-chart-branch-url" name="ays-chart-org-chart-branch-url" placeholder="Url" value="${branchUrlInpValue}">
                    </div>
                </div> 
                <div class="ays-chart-org-chart-manual-branch-options-rigth-box">
                    <button class="button change-branch-options">Change</button>
                </div>
            </div>
        `;
        currentBranchWrapper.append(branchOptions);
        currentBranchWrapper.addClass("ays-chart-builder-active-options");

        openCloseButton.removeClass("open-branch-options");
        openCloseButton.addClass("close-branch-options");
        openCloseIcon.addClass("transform-open-close-icon");
     }

     this.closeBranchOptions = function ($triggerElement) {
        var currentBranchWrapper = $triggerElement.parents(".branch-wrapper");

        var openCloseButton = $triggerElement.parent();
        var openCloseIcon =$triggerElement;
        if (!$triggerElement.hasClass("fa")) {
            var openCloseButton = $triggerElement;
            var openCloseIcon = openCloseButton.children();
        }

        currentBranchWrapper.find(".ays-chart-org-chart-manual-branch-options-container").remove();
        currentBranchWrapper.removeClass("ays-chart-builder-active-options");

        openCloseButton.removeClass("close-branch-options");
        openCloseButton.addClass("open-branch-options");
        openCloseIcon.removeClass("transform-open-close-icon");
    }

    this.changeBranchOptions = function ($triggerElement) {
        const { treeSelector, branchSelector } = self.options;

        var currentBranchWrapper = $triggerElement.parents(".branch-wrapper");
        var showedBranchTitle = currentBranchWrapper.find(".branch-title");
        var oldName = showedBranchTitle.text();

        var openCloseButton = currentBranchWrapper.find(".close-branch-options");
        var currentBranchId = openCloseButton.attr("data-source-id");

        var branchChangedName = $triggerElement.parents(".ays-chart-org-chart-manual-branch-options-container").find("#ays-chart-org-chart-branch-name").val();
        var branchChangedDescription = $triggerElement.parents(".ays-chart-org-chart-manual-branch-options-container").find("#ays-chart-org-chart-branch-description").val();
        var branchChangedImage = $triggerElement.parents(".ays-chart-org-chart-manual-branch-options-container").find("#ays-chart-org-chart-branch-image-url").val();
        var branchChangedTooltip = $triggerElement.parents(".ays-chart-org-chart-manual-branch-options-container").find("#ays-chart-org-chart-branch-tooltip").val();
        var branchChangedUrl = $triggerElement.parents(".ays-chart-org-chart-manual-branch-options-container").find("#ays-chart-org-chart-branch-url").val();

        currentBranchWrapper.find(".ays-chart-org-chart-name-" + currentBranchId).val(branchChangedName);
        currentBranchWrapper.find(".ays-chart-org-chart-description-" + currentBranchId).val(branchChangedDescription);
        currentBranchWrapper.find(".ays-chart-org-chart-image-" + currentBranchId).val(branchChangedImage);
        currentBranchWrapper.find(".ays-chart-org-chart-tooltip-" + currentBranchId).val(branchChangedTooltip);
        currentBranchWrapper.find(".ays-chart-org-chart-url-" + currentBranchId).val(branchChangedUrl);
        $(document).find('.ays-chart-org-chart-parent-name[value="'+oldName+'"]').val(branchChangedName);

        showedBranchTitle.text(branchChangedName);
        $(treeSelector).detectManualChange();
        this.closeBranchOptions(openCloseButton);
    }
 
     this.updateBranchZIndex = function () {
         const { treeSelector, branchSelector } = self.options;
         const $branches = $(`${treeSelector} > ${branchSelector}`);
         const length = $branches.length;
 
         $branches.length &&
             $branches.each(function (index) {
                 $(this).css('z-index', Math.max(1, length - index));
             });
     };
 
     this.initSorting = function () {
         const {
             treeSelector,
             dragHandlerSelector,
             placeholderName,
             childrenBusSelector,
             branchPathSelector,
             branchSelector,
             levelPrefix,
             dataAttributes,
             maxLevel,
         } = self.options;
 
         self.updateBranchZIndex();
 
         /** Store the current level, for sorting the item after stop dragging. */
         let currentLevel = 1,
             originalLevel = 1,
             childrenBus = null,
             helperHeight = 0,
             originalIndex = 0;
 
         /** Render the branch paths initially. */
         $(self.options.treeSelector).calculateSiblingDistances();
 
         /** Update the placeholder branch level by new level. */
         const updatePlaceholder = (placeholder, level) => {
             placeholder.updateBranchLevel(level);
             currentLevel = level;
         };
 
         /** Check if we can swap items vertically for branch with children */
         const canSwapItems = ui => {
             let offset = ui.helper.offset(),
                 height = offset.top + helperHeight,
                 nextBranch = ui.placeholder.nextBranch(),
                 nextBranchOffset = nextBranch.offset() || 0,
                 nextBranchHeight = nextBranch.outerHeight();
 
             return height > nextBranchOffset.top + nextBranchHeight / 3;
         };
 
         $(treeSelector).sortable({
             handle: dragHandlerSelector,
             placeholder: placeholderName,
             items: '> *',
             start(_, ui) {
                 /** Synchronize the placeholder level with the item's level. */
                 const level = ui.item.getBranchLevel();
                 ui.placeholder.updateBranchLevel(level);
                 originalIndex = ui.item.index();
 
                 /**  Store the original level. */
                 originalLevel = level;
 
                 /** Fill the children bus with the children. */
                 childrenBus = ui.item.find(childrenBusSelector);
                 childrenBus.append(ui.item.next().getDescendants());
 
                 /**
                  * Calculate the placeholder width & height according to the
                  * helper's width & height respectively.
                  */
                 let height = childrenBus.outerHeight();
                 let placeholderMarginTop = ui.placeholder.css('margin-top');
 
                 height += height > 0 ? self.pxToNumber(placeholderMarginTop) : 0;
                 height += ui.helper.outerHeight();
                 helperHeight = height;
                 height -= 2;
 
                 let width = ui.helper.find(branchSelector).outerWidth() - 2;
                 ui.placeholder.css({ height, width });
 
                 const tmp = ui.placeholder.nextBranch();
                 tmp.css('margin-top', self.numberToPx(helperHeight));
                 ui.placeholder.detach();
                 $(this).sortable('refresh');
                 ui.item.after(ui.placeholder);
                 tmp.css('margin-top', 0);
 
                 // Set the current level by the initial item's level.
                 currentLevel = level;
                 $(`${treeSelector} ${branchSelector} ${branchPathSelector}`).hide();
             },
             sort(_, ui) {
                 const { depth, maxLevel } = self.options;
                 let treeEdge = self.getTreeEdge(),
                     offset = ui.helper.offset(),
                     currentBranchEdge = offset.left,
                     lowerBound = 1,
                     upperBound = maxLevel;
 
                 /**
                  * Calculate the upper bound. The upper bound would be,
                  * the minimum value between the
                  * (previous branch level + 1) and the maxLevel.
                  */
                 let prevBranch = ui.placeholder.prevBranch();
                 prevBranch = prevBranch[0] === ui.item[0] ? prevBranch.prevBranch() : prevBranch;
 
                 let prevBranchLevel = prevBranch.getBranchLevel();
                 upperBound = Math.min(prevBranchLevel + 1, maxLevel);
 
                 /**
                  * Calculate the lower bound. The lower bound would be,
                  * the maximum value between the
                  * Next Sibling Level and 1
                  */
                 let nextSibling = ui.placeholder.nextSibling(),
                     placeholderLevel = 1;
 
                 if (nextSibling.length) {
                     placeholderLevel = ui.placeholder.getBranchLevel() || 1;
                 } else {
                     /**
                      * If no sibling found then
                      * the placeholder level would be the next branch's level.
                      */
                     let nextBranch = ui.placeholder.nextBranch();
                     placeholderLevel = nextBranch.getBranchLevel() || 1;
                 }
 
                 lowerBound = Math.max(1, placeholderLevel);
 
                 /**
                  * Calculate the position which is the current helper offset left
                  * minus the tree parent's offset left.
                  * Find the changed level by dividing the position by depth value.
                  *
                  * The final valid changed level would be a value
                  * between upper and lower bound inclusive.
                  */
                 let position = Math.max(0, currentBranchEdge - treeEdge);
                 let newLevel = Math.floor(position / depth) + 1;
                 newLevel = Math.max(lowerBound, Math.min(newLevel, upperBound));
 
                 if (canSwapItems(ui)) {
                     let nextBranch = ui.placeholder.nextBranch();
 
                     if (nextBranch.getDescendants().length) {
                         newLevel = nextBranch.getBranchLevel() + 1;
                     }
 
                     nextBranch.after(ui.placeholder);
                     $(this).sortable('refreshPositions');
                 }
 
                 /** Update the placeholder position by the changed level. */
                 updatePlaceholder(ui.placeholder, newLevel);
             },
             change(_, ui) {
                 let prevBranch = ui.placeholder.prevBranch();
 
                 prevBranch = prevBranch[0] === ui.item[0] ? prevBranch.prevBranch() : prevBranch;
 
                 /**
                  * After changing branches bound the placeholder to the
                  * changed boundary.
                  */
                 let prevBranchLevel = prevBranch.getBranchLevel() || 1;
 
                 if (prevBranch.length) {
                     ui.placeholder.detach();
                     let children = prevBranch.getDescendants();
                     if (children && children.length) prevBranchLevel += 1;
                     ui.placeholder.updateBranchLevel(prevBranchLevel);
                     prevBranch.after(ui.placeholder);
                 }
                 $(treeSelector).detectManualChange();
             },
             stop(_, ui) {
                 $(`${branchSelector}:not(${levelPrefix}-1) ${branchPathSelector}`).show();
 
                 /**
                  * Place the children after the sorted item,
                  * and clear the children bus.
                  */
                 const children = childrenBus.children().insertAfter(ui.item);
                 childrenBus.empty();
 
                 /** Update the item by currently changed level. */
                 ui.item.updateBranchLevel(currentLevel);
                 children.shiftBranchLevel(currentLevel - originalLevel);
 
                 /**
                  * Trigger `sortCompleted` event if the level changed or index changed.
                  * i.e. if the items sorted then trigger the event.
                  */
                 if (currentLevel !== originalLevel || originalIndex !== ui.item.index()) {
                     $(treeSelector).trigger('sortCompleted', [ui]);
                 }
 
                 // Calculate the sibling distance after sorting
                 $(this).calculateSiblingDistances();
 
                 self.updateBranchZIndex();
 
                 /** Update the parent ID and Name after sorting. */
                 const $parent = ui.item.getParent();
                 const $parentName = $parent.find($(".ays-chart-org-chart-name-" + $parent.data(dataAttributes.id))).val();
                 ui.item
                     .data(dataAttributes.parent, $parent.data(dataAttributes.id))
                     .attr(`data-${dataAttributes.parent}`, $parent.data(dataAttributes.id))
                     .find($(".ays-chart-org-chart-parent")).val($parent.data(dataAttributes.id));
                 ui.item.find($(".ays-chart-org-chart-parent-name")).val($parentName);
             },
         });
     };
 }