/* Public defaults baked from the visual editor export. */
(function () {
  var defaults = {"zlc_portfolio_v3_text_style_ai-creator-title":"{\"fs\":103.4,\"ls\":-7.83,\"lh\":1.0999999999999999}","zlc_portfolio_v3_text_docking-ac12-name":"拓展坞","zlc_portfolio_v3_image_style_adapters-img-1":"{\"height\":542}","zlc_portfolio_v3_text_style_ai-immersive-title":"{\"fs\":97.4,\"ls\":-4,\"lh\":1.05}","zlc_portfolio_v3_image_style_gallery-img-12":"{\"height\":470}","zlc_portfolio_v3_text_style_ai-mobile-title":"{\"fs\":103.4,\"ls\":-7.83,\"lh\":1.15}","zlc_portfolio_v3_custom_items":"[]","zlc_portfolio_v3_text_series-05-desc":"手机自拍屏","zlc_portfolio_v3_text_style_ai-worlds-title":"{\"fs\":103.4,\"ls\":-7.83,\"lh\":1.0999999999999999}","zlc_portfolio_v3_text_style_ai-scene-hero-title":"{\"fs\":106.315,\"ls\":-8.12362,\"lh\":1.1600055910170992}","zlc_portfolio_v3_image_style_gallery-img-09":"{\"height\":470}","zlc_portfolio_v3_order_portfolio-gallery":"[\"gallery-02\",\"gallery-04\",\"gallery-05\",\"gallery-06\",\"gallery-10\",\"gallery-07\",\"gallery-03\",\"gallery-09\",\"gallery-12\",\"gallery-11\"]","zlc_portfolio_v3_order_ai-gallery":"[\"gallery-08\",\"gallery-01\"]","zlc_portfolio_v3_image_style_gallery-img-03":"{\"height\":470}","zlc_portfolio_v3_text_kv-2026-category-note-title":"不同的使用场景，不同的场景氛围。","zlc_portfolio_v3_text_gallery-01-title":"Ai-场景生成","zlc_portfolio_v3_text_adapters-p1-name":"让小接口解决大兼容问题。"};
  var version = "2026-09-18T03:09:02.115Z";
  var versionKey = "zlc_portfolio_public_defaults_version";
  try {
    if (window.localStorage.getItem(versionKey) !== version) {
      Object.keys(defaults).forEach(function (key) {
        window.localStorage.setItem(key, defaults[key]);
      });
      window.localStorage.setItem(versionKey, version);
    }
  } catch (error) {
    /* The site remains usable when storage is unavailable. */
  }
})();
