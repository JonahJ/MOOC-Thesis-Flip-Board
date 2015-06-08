/**
 * Guide:
 *
 * IMG_TYPE is the img type for files
 *
 * All images must be in directories corresponding to their id and be ordered,
 * with small numbers (<10) prepending a zero.
 *
 * Galleries is a list of all galleries to load. The ID number corresponds to
 * the HTML id and the image path. repeat means whether to loop or not. Count_max
 * means how many images to load.
 */

const IMG_TYPE = ".jpg";

var galleries = [{
    id: "wireframe-exercise",
    repeat: true,
    count_max: 9,
}, {
    id: "weekly-clicks",
    repeat: true,
    count_max: 15,
}, {
    id: "clicks-per-unit-type",
    repeat: true,
    count_max: 10,
}, {
    id: "navigation-bar",
    repeat: true,
    count_max: 13,
}, {
    id: "topography",
    repeat: true,
    count_max: 31,
}, ];

var galleryObject = function(options) {
    var self = this;

    if (options === undefined) options = {};
    if (options.id === undefined) throw "no id provided";
    if (options.repeat === undefined) options.repeat = false;
    if (options.count_max === undefined) options.count_max = 1;

    /**
     * Settings
     */
    self.id = options.id;
    self.repeat = options.repeat;
    self.count_max = options.count_max;

    self.topic_container = $("#" + self.id);
    self.interactive = self.topic_container.find(".interactive");

    if (self.interactive.children().length > 1) {
        throw "too many interactive elements";
    }

    var directory = "img/gallery/" + self.id;

    /**
     * Load images
     */
    for (var each_image_number = 0; each_image_number <= self.count_max; each_image_number++) {

        var number_string = each_image_number.toString();

        /**
         * Prepend zero
         */
        if (each_image_number < 10) {
            number_string = "0" + number_string;
        }

        var pathname = window.location.pathname;
        pathname = pathname.replace("index.html", "");

        var image_path = pathname + directory + "/" + number_string + IMG_TYPE;

        var img = new Image();
        img.src = image_path;
        img.className = "gallery-image";

        if (each_image_number !== 0) {
            img.style.display = "none";
        }

        self.interactive.append(img)
    }

    self.previous_scroll_position = 0;
    self.amount_scrolled = 0;

    self.current_slide = 0;
    self.finished = false;

    self.header_length = $("header").height(); //document.getElementsByTagName("header")[0].scrollHeight;
    self.header_length -= $("#header-img").height();

    /**
     * For Scroll
     */
    self.topic = {
        interactive: {
            position: $('#' + self.id).find('.interactive').offset(),
            length: $('#' + self.id).find('.interactive').height(),
        },
        position: $("#" + self.id).position(),
        length: self.topic_container.scrollHeight, // + document.getElementsByClassName("gallery-image")[0].scrollHeight, // Add image heigh
    };

    self.topic.per_slide = self.topic.interactive.length / self.interactive.children().length;
    self.topic.per_slide /= 2;
    self.position = {
        start: (self.topic.interactive.position.top) + self.header_length,
        end: (self.topic.interactive.position.top + self.topic.interactive.length) + self.header_length //(/*topic.position.top + topic.length*/)
    };

    return self;
}
galleryObject.prototype.constructor = galleryObject;

galleryObject.prototype.scroll = function() {
    var self = this;

    $(window).scroll(function() {
        var current_scroll_position = $(document).scrollTop();

        self.topic = {
            interactive: {
                position: $('#' + self.id).find('.interactive').offset(),
                length: $('#' + self.id).find('.interactive').height(),
            },
            position: $("#" + self.id).position(),
            length: self.topic_container.scrollHeight, // + document.getElementsByClassName("gallery-image")[0].scrollHeight, // Add image heigh
        };

        self.topic.per_slide = self.topic.interactive.length / self.interactive.children().length;
        self.topic.per_slide /= 2;

        self.position = {
            start: (self.topic.interactive.position.top) + self.header_length,
            end: (self.topic.interactive.position.top + self.topic.interactive.length) + self.header_length //(/*topic.position.top + topic.length*/)
        };

        if (self.position.end <= current_scroll_position) {
            /**
             * If gallery is finished
             */
            // console.log("END " + "  " + self.id);
        } else if (self.position.start <= current_scroll_position) {
            /**
             * If gallery is active
             */

            /**
             * Set amount scrolled
             */
            self.amount_scrolled = current_scroll_position - self.previous_scroll_position + self.amount_scrolled;
            self.previous_scroll_position = current_scroll_position;

            if (Math.abs(self.amount_scrolled) >= self.topic.per_slide) {
                if (self.amount_scrolled < 0) {
                    /**
                     * Backward
                     */

                    self.interactive.children().eq(self.current_slide).css("display", "none");
                    self.current_slide -= 1;
                    if (self.current_slide < 0) {
                        if (self.repeat === true) {
                            self.current_slide = self.interactive.children().length - 1;
                        } else {
                            self.current_slide = 0;
                        }
                    }
                    self.interactive.children().eq(self.current_slide).css("display", "");

                } else {
                    /**
                     * Forward
                     */
                    if (self.current_slide == self.interactive.children().length - 1) {
                        /**
                         * If current slide is last slide
                         */
                        if (self.repeat === true) {
                            self.interactive.children().eq(self.current_slide).css("display", "none");
                            self.current_slide = 0;
                            self.interactive.children().eq(self.current_slide).css("display", "");
                        }
                    } else {
                        self.interactive.children().eq(self.current_slide).css("display", "none");
                        self.current_slide += 1;

                        try {
                            self.interactive.children().eq(self.current_slide).css("display", "");
                        } catch (err) {

                            try {

                                self.interactive.children().eq(self.interactive.childNodes.length - 1).css("display", "none");

                            } catch (err) {

                                /**
                                 * Should only break if other DOM elements
                                 * are added to the interactive
                                 */
                                // console.log("current_slide: " + self.current_slide);
                                // console.log(interactive.childNodes);
                            }
                        }
                    }
                }

                /**
                 * Reset amount to 0
                 */
                self.amount_scrolled = 0;
            }
        } else {
            /**
             * If gallery has not yet been activated
             */
            // console.log( current_scroll_position+ " " +  self.position.start + " " +self.id);
        }
    });

    return self;
}


$(document).ready(function() {

    /**
     * Load Social Sharing icons
     */
    Socialite.load();

    /**
     * Load Galleries
     */
    galleries.forEach(function(gallery, index, array) {
        var each_gallery = new galleryObject({
            id: gallery.id,
            repeat: gallery.repeat,
            count_max: gallery.count_max,
        });

        each_gallery.scroll();
    });


});
