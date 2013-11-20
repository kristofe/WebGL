test("Antialiasing support", function() {
   var attr = gl.getContextAttributes();
   ok(true == attr.antialias, "Antialiasing Support");
});
