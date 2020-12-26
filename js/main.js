(function () {

  let _devices = {
    "a-s": {
      key: "a-s",
      label: "Auto Screen",
      size: [0,0],
    },
    "ip-x": {
      key: "ip-x",
      label: "Iphone X - XS",
      size: [375,812],
    },
    "ip-xsmax": {
      key: "ip-xsmax",
      label: "Iphone XS Max - XR - 11",
      size: [414,896],
    }
  };

  let _dayName = ["mon", "tue", "wed", "thu", "fri", "sat"];

  let _timetable = [
    {
      header: "a.m.",
      table: [
        ["cc", "av", "av", "sinh", "địa"],
        ["lý", "lý", "sinh", "văn", "văn"],
        ["văn", "văn", "toán", "", ""],
        ["anh", "anh", "toán", "toán", "cn"],
        ["sử", "toán", "gdcd", "anh", "anh"],
        ["hóa", "hóa", "tin", "tin", "shl"],
      ]
    },
    {
      header: "p.m.",
      table: [
        ["nghề", "nghề", "", "", ""],
        ["", "", "", "", ""],
        ["gdqp", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "td", "td", ""],
        ["", "", "", "", ""],
      ]
    }
  ];

  let _timetableTemplate =
  `<div class="timetable">
    <div class="t-group" v-for="(group, gr_i) in table">

      <div class="t-header" v-if="hasHeader">{{ group.header }}</div>

      <div class="t-content">

        <!-- NUMBERS -->
        <div class="t-col t-num" v-if="hasNumber">
          <div class="t-cell t-label" v-if="gr_i == 0 && hasDayName">

          </div>

          <div class="t-cell t-label t-ln" v-for="n in [1, 2, 3, 4, 5]">
            {{n}}
          </div>
        </div>

        <div class="t-col" v-for="(column, col_i) in group.table">
          <!-- DAY NAMES -->
          <div class="t-cell t-label" v-if="gr_i == 0 && hasDayName">
            {{ dayName[col_i] }}
          </div>

          <div class="t-cell" v-for="cell in column">
          {{cell}}
          </div>
        </div>

      </div>

    </div>
  </div>`;

  let screenBreak;

  let resizePreview = function(_v) {
    let configOffset = '',
        offsetAmount = 0;
    let windowW = window.innerWidth,
        windowH = window.innerHeight,
        _preW = _v.previewWidth,
        _preH = _v.previewHeight;

    if (_preH > windowH) { // Height Overflow
      _v.previewScale = (windowH - _v.previewMargin*2)/_preH;
    }
    if (_preW*_v.previewScale > windowW) { // Width Overflow
      _v.previewScale = (windowW - _v.previewMargin*2)/_preW;
    }

    /*if (windowW > screenBreak) {*/
      offsetAmount = _v.previewMargin*2 + _v.previewWidth*_v.previewScale;
      configOffset = `0 0 0 ${offsetAmount}px`;
      _v.isSmallScreen = false;
    /*} else {
      offsetAmount = _v.previewMargin*4 + _v.previewHeight*_v.previewScale;
      configOffset = `${offsetAmount}px 0 0 0`;
      _v.isSmallScreen = true;
    }*/
    _v.configOffset = configOffset;
  };
  let setPreviewSize = function(_v) {
    let _preW, _preH,
       curDeviceKey = _v.selectedDevice;
    if (curDeviceKey == "a-s") {
      let screenW = window.screen.width,
          screenH = window.screen.height;
      if (screenW > screenH) {
        _preW = screenH;
        _preH = screenW;
      } else {
        _preW = screenW;
        _preH = screenH;
      }
    } else {
      let curDevice = _devices[curDeviceKey];
      _preW = curDevice.size[0];
      _preH = curDevice.size[1];
    }

    screenBreak = _preW + _v.previewMargin*2;

    _v.previewWidth = _preW;
    _v.previewHeight = _preH;

    resizePreview(_v);
  };

  let onMounted = function() {
    // CALCULATE PREVIEW WIDTH AND HEIGHT
    setPreviewSize(this);

    // FIT PREVIEW AND CONFIG TO VIEWPORT
    window.addEventListener('resize', () => {
      resizePreview(this);
    });
  };

  let updateColors = function(src) {
    let img = document.createElement('img');
    img.setAttribute('src', src)

    img.addEventListener('load', function() {
        let vibrant = new Vibrant(img,
                                  64,
                                  6);
        let swatches = vibrant.swatches(),
            primary = (swatches.Vibrant) ? swatches.Vibrant.getHex() : (swatches.Muted) ? swatches.Muted.getHex() : '#000',
            text = (swatches.Vibrant) ? swatches.Vibrant.getTitleTextColor() : (swatches.Muted) ? swatches.Muted.getTitleTextColor() : '#fff',
            scrim = (swatches.DarkVibrant) ? swatches.DarkVibrant.getHex() : (swatches.DarkMuted) ? swatches.DarkMuted.getTitleTextColor() : '#000';

        let root = document.querySelector(".app-root");

        root.style.setProperty('--timetable-primary', primary);
        root.style.setProperty('--timetable-text', text);
        root.style.setProperty('--timetable-scrim', scrim);
        /*
         * Results into:
         * Vibrant #7a4426
         * Muted #7b9eae
         * DarkVibrant #348945
         * DarkMuted #141414
         * LightVibrant #f3ccb4
         */
    });
  };
  let _clickUpload = function(_v) {
    let input = document.createElement('input');
    input.type = 'file';
    input.click();

    input.addEventListener("change", (e) => {
      const reader = new FileReader();
      const file = e.target.files[0];

      reader.addEventListener("load", function () {
        _v.imgSrc = reader.result;
        updateColors(reader.result);
      }, false);

      if (file) {
        reader.readAsDataURL(file);
        input.remove();
      }
    });
  };

  let _saveCanvas = function(_v) {
    let tempScale = _v.previewScale;
    _v.previewScale = 1;

    domtoimage.toPng(document.querySelector(".preview"))
    .then(function (dataUrl) {
      let link = document.createElement('a');

      link.addEventListener('click', function(e) {
          link.href = dataUrl;
          link.download = "timetable.png";
      }, false);

      link.click();
      _v.previewScale = tempScale;
    });
  };

  Vue.component('lw-timetable', {
    props: ['table', 'day-name', 'has-header', 'has-day-name', 'has-number'],
    template: _timetableTemplate
  })

  let app = new Vue({
    el: '#app',
    data: {
      isSmallScreen: false,
      selectedDevice: "a-s",
      devices: _devices,

      previewWidth: 100,
      previewHeight: 200,
      preview: '',
      previewScale: 1,
      previewMargin: 16,

      configOffset: 0,

      imgSrc: "",
      imgOpacity: 32,

      text: "timetable.",
      table: _timetable,
      dayName: _dayName,
      hasHeader: true,
      hasDayName: true,
      hasNumber: true,
    },
    methods: {
      saveCanvas: function() {
        _saveCanvas(this);
      },
      onSelectDevice: function() {
        setPreviewSize(this);
      },
      clickUpload: function() {
        _clickUpload(this);
      },
    },
    mounted: onMounted,
  });

}());
