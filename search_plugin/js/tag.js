(function($) {

    $.widget('ui.tagit', {
        options: {
            allowDuplicates   : false,
            placeholderText   : null,  
            readOnly          : false, 
            availableTags     : ['si','sa'],
            autocomplete: {}
        },

        _create: function() {

            var that = this;


            this.tagList = this.element.find('ul').andSelf().last();
            
            this.tagInput = $('<input type="text" />').addClass('ui-widget-content');

            
            if (!this.options.autocomplete.source) {
                this.options.autocomplete.source = function(search, showChoices) {
                    var filter = search.term.toLowerCase();
                    var choices = $.grep(this.options.availableTags, function(element) {

                        return (element.toLowerCase().indexOf(filter) === 0);
                    });
                    if (!this.options.allowDuplicates) {
                        choices = this._subtractArray(choices, this.assignedTags());
                    }
                    showChoices(choices);
                };


            // Bind autocomplete.source callback functions to this context.
            if ($.isFunction(this.options.autocomplete.source)) {
                this.options.autocomplete.source = $.proxy(this.options.autocomplete.source, this);
            }}

        
            this.tagList
                .addClass('tagit')
                .addClass('ui-widget ui-widget-content ui-corner-all')
                // Create the input field.
                .append($('<li class="tagit-new"></li>')
                .append(this.tagInput))
                .click(function(e) {
                    that.tagInput.focus();
                });

                        
            // Events.
            this.tagInput
                .keydown(function(event) {
                    if (event.which == $.ui.keyCode.SPACE) {
                        event.preventDefault();
                        that.createTag(that._cleanedInput());
                    }
                });

            //Autocomplete
            if (this.options.availableTags) {
                var autocompleteOptions = {
                    select: function(event, ui) {
                        that.createTag(ui.item.value);
                        // Preventing the tag input to be updated with the chosen value.
                        return false;
                    }
                };
                $.extend(autocompleteOptions, this.options.autocomplete);

                this.tagInput.autocomplete(autocompleteOptions).bind('autocompleteopen.tagit', function(event, ui) {
                    that.tagInput.data('autocomplete-open', true);
                }).bind('autocompleteclose.tagit', function(event, ui) {
                    that.tagInput.data('autocomplete-open', false);
                });

                this.tagInput.autocomplete('widget').addClass('tagit-autocomplete');
            }
        },


        _cleanedInput: function() {
            return $.trim(this.tagInput.val().replace(/^"(.*)"$/, '$1'));
        },

        
        _tags: function() {
            return this.tagList.find('.tagit-choice:not(.removed)');
        },


        assignedTags: function() {
            // Returns an array of tag string values
            var that = this;
            var tags = [];
            if (this.options.singleField) {
                tags = $(this.options.singleFieldNode).val().split(this.options.singleFieldDelimiter);
                if (tags[0] === '') {
                    tags = [];
                }
            } else {
                this._tags().each(function() {
                    tags.push(that.tagLabel(this));
                });
            }
            return tags;
        },

        
        _subtractArray: function(a1, a2) {
            var result = [];
            for (var i = 0; i < a1.length; i++) {
                if ($.inArray(a1[i], a2) == -1) {
                    result.push(a1[i]);
                }
            }
            return result;
        },
        
        
        tagLabel: function(tag) {
            // Returns the tag's string label.
            if (this.options.singleField) {
                return $(tag).find('.tagit-label:first').text();
            } else {
                return $(tag).find('input:first').val();
            }
        },

        
        _findTagByLabel: function(name) {
            var that = this;
            var tag = null;
            this._tags().each(function(i) {
                if (that._formatStr(name) == that._formatStr(that.tagLabel(this))) {
                    tag = $(this);
                    return false;
                }
            });
            return tag;
        },
        
        
        _isNew: function(name) {
            return !this._findTagByLabel(name);
        },

        
        _formatStr: function(str) {
            if (this.options.caseSensitive) {
                return str;
            }
            return $.trim(str.toLowerCase());
        },

        
        _effectExists: function(name) {
            return Boolean($.effects && ($.effects[name] || ($.effects.effect && $.effects.effect[name])));
        },

        
        createTag: function(value, additionalClass, duringInitialization) {
            var that = this;

            value = $.trim(value);

            if (value === '') {
                return false;
            }


            console.dir(this.tagInput.data('autocomplete-open'));


            if (!this.options.allowDuplicates && !this._isNew(value)) {
                var existingTag = this._findTagByLabel(value);
                if (this._trigger('onTagExists', null, {
                    existingTag: existingTag,
                    duringInitialization: duringInitialization
                }) !== false) {
                    if (this._effectExists('highlight')) {
                        existingTag.effect('highlight');
                    }
                }
                return false;
            }

            var label = $('<span class="tagit-label"></span>').text(value);
            
            // Create tag.
            var tag = $('<li></li>')
                .addClass('tagit-choice ui-widget-content ui-state-default ui-corner-all')
                .addClass(additionalClass)
                .append(label);
            
            tag.addClass('tagit-choice-editable');
            //must be remove icon

            if (!this.options.singleField) {
                var escapedValue = label.html();
                tag.append('<input type="hidden" value="' + escapedValue + '" name="' + this.options.fieldName + '" class="tagit-hidden-field" />');
            }

            this.tagInput.val('');
            // Insert tag.
            this.tagInput.parent().before(tag);
        }
    });
})(jQuery);