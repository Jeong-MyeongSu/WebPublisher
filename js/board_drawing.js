document.addEventListener("DOMContentLoaded", function() {
  // main 캔버스 초기 설정
  var width   = 1400 ;
  var height  = 800 ;

  var canvas_main  = document.getElementById('canvas_main');
  var ctx_main = canvas_main.getContext('2d');
  canvas_main.width = width;
  canvas_main.height = height;
  var colors = document.getElementsByClassName('color');
  var widths = document.getElementsByClassName('width');
  var tools = document.getElementsByClassName('tool');
  var owners = document.getElementsByClassName('owner');
  var page_control = document.getElementsByClassName('page_control');
  var html_prev_tag = document.getElementById('prev');
  var html_page_tag = document.getElementById('cur_page');
  var html_next_tag = document.getElementById('next');
  var hide_button = document.getElementsByClassName('hide_button');
  const init = '[{"prev_pos":{"x":0,"y":0},"cur_pos":{"x":0,"y":0},"tool":"pen","color":"white","width":2}';

  var socket  = io.connect();
  var mouse = {
    owner: "",
    cur_prof_page: 1,
    cur_stud_page: 1,
    click: false,
    prev_pos: {x:0, y:0},
    tool: "pen",
    color: "black",
    width: 2
  };
  var pen = { // 펜 기본 두께
    width: 2
  }
  var eraser = {  // 지우개 기본 두께
    width: 30
  }

  var diff_w = width/window.innerWidth;
  var diff_h = height/window.innerHeight;

  if(user_type == 'professor'){
    mouse.owner = 'professor';
    var target_canvas = document.getElementById('prof_1');
    target_canvas.setAttribute( 'draggable', 'true' );
    addEventToCanvas(target_canvas);
  }else if(user_type == 'student'){
    mouse.owner = 'student';
    document.getElementById("prof_page").style.visibility='hidden';
    var target_prof_canvas = document.getElementById('prof_1');
    var target_stud_canvas = document.getElementById('stud_1');
    target_stud_canvas.setAttribute( 'draggable', 'true' );
    addEventToCanvas(target_prof_canvas);
    addEventToCanvas(target_stud_canvas);
  }

  // 과목명에 맞는 판서 불러오기 요청
  var course_name = getParam("name");
  socket.emit("getboard", course_name);

  // main 캔버스 마우스 지원 핸들러
  canvas_main.addEventListener('mousedown', onMouseDown, false);
  canvas_main.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  canvas_main.addEventListener('mouseup', onMouseUp, false);
  canvas_main.addEventListener('mouseout', onMouseUp, false);
  // main 캔버스 터치 지원 핸들러
  canvas_main.addEventListener('touchstart', onMouseDown, false);
  canvas_main.addEventListener('touchmove', throttle(onMouseMove, 10), false);
  canvas_main.addEventListener('touchend', onMouseUp, false);
  canvas_main.addEventListener('touchcancel', onMouseUp, false);
  // 화면 크기 변화 처리 핸들러
  window.addEventListener('resize', onResize, false);
  // 컬러 선택 핸들러
  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
    colors[i].addEventListener('touchstart', onColorUpdate, false);
  }
  // 굵기 선택 핸들러
  for (var i = 0; i < widths.length; i++){
    widths[i].addEventListener('click', onWidthUpdate, false);
    widths[i].addEventListener('touchstart', onWidthUpdate, false);
  }
  // 도구 선택 핸들러
  for (var i = 0; i < tools.length; i++){
    tools[i].addEventListener('click', onToolUpdate, false);
    tools[i].addEventListener('touchstart', onToolUpdate, false);
  }
  // 판서 선택 핸들러
  for (var i = 0; i < owners.length; i++){
    owners[i].addEventListener('click', onOwnerUpdate, false);
    owners[i].addEventListener('touchstart', onOwnerUpdate, false);
  }
  // 페이지 핸들러
  for (var i = 0; i < page_control.length; i++){
    page_control[i].addEventListener('click', onPageControl, false);
    page_control[i].addEventListener('touchstart', onPageControl, false);
  }

  // 핸들러 처리 함수
  function onMouseDown(e){
    mouse.click = true;
    mouse.prev_pos.x = e.clientX * diff_w || e.touches[0].clientX * diff_w;
    mouse.prev_pos.y = e.clientY * diff_h || e.touches[0].clientY * diff_h;
    drawLine(mouse.prev_pos.x, mouse.prev_pos.y, mouse.prev_pos.x, mouse.prev_pos.y, mouse.tool, mouse.color, mouse.width, ctx_main, true);
    if(user_type == 'professor'){
      var target_ctx = document.getElementById('prof_' + mouse.cur_prof_page).getContext('2d');
    }else if(user_type == 'student'){
      var target_ctx = document.getElementById('stud_' + mouse.cur_stud_page).getContext('2d');
    }
    drawLine(mouse.prev_pos.x, mouse.prev_pos.y, mouse.prev_pos.x, mouse.prev_pos.y, mouse.tool, mouse.color, mouse.width, target_ctx, false);

  };
  function onMouseMove(e) {
    if(mouse.click){
      var cur_x = e.clientX * diff_w||e.touches[0].clientX * diff_w;
      var cur_y = e.clientY * diff_h||e.touches[0].clientY * diff_h;
      drawLine(mouse.prev_pos.x, mouse.prev_pos.y, cur_x, cur_y, mouse.tool, mouse.color, mouse.width, ctx_main, true);
      if(user_type == 'professor'){
        var target_ctx = document.getElementById('prof_' + mouse.cur_prof_page).getContext('2d');
      }else if(user_type == 'student'){
        var target_ctx = document.getElementById('stud_' + mouse.cur_stud_page).getContext('2d');
      }
      drawLine(mouse.prev_pos.x, mouse.prev_pos.y, cur_x, cur_y, mouse.tool, mouse.color, mouse.width, target_ctx, false);

      mouse.prev_pos.x = cur_x;
      mouse.prev_pos.y = cur_y;
    }
  };
  function onMouseUp(e){
    if (mouse.click) {
      mouse.click = false;
    }
  };
  function onResize() {
    diff_w = width/window.innerWidth;
    diff_h = height/window.innerHeight;
  }
  function onColorUpdate(e){
    mouse.color = e.target.className.split(' ')[2];
  }
  function onWidthUpdate(e){
    if(mouse.tool=='pen'){
      pen.width = e.target.className.split(' ')[3];
      mouse.width = pen.width;
    }else if(mouse.tool=='eraser'){
      eraser.width = e.target.className.split(' ')[3];
      mouse.width = pen.width;
    }
  }
  function onToolUpdate(e, v){
    if(e){
      var tool = e.target.className.split(' ')[3];
    }else{
      var tool = v;
    }

    if(tool == 'pen'){
      mouse.tool = tool;
      mouse.width = pen.width;
    }else if(tool == 'eraser'){
      mouse.tool = tool;
      mouse.width = eraser.width;
    }else if(tool == 'clear'){
      if(user_type == 'professor'){
        var ctx_prof = document.getElementById('prof_'+mouse.cur_prof_page).getContext('2d');
        ctx_main.clearRect(0, 0, width, height);
        ctx_prof.clearRect(0, 0, width, height);
        socket.emit("clear", {course_name: course_name, page: mouse.cur_prof_page});
      }else if(user_type == 'student'){
        var ctx_stud = document.getElementById('stud_'+mouse.cur_stud_page).getContext('2d');
        ctx_main.clearRect(0, 0, width, height);
        ctx_stud.clearRect(0, 0, width, height);
        socket.emit("clear", {course_name: course_name, page: mouse.cur_stud_page});
      }
    }
  }
  function onOwnerUpdate(e){
    var target_owner = e.target.className.split(' ')[3];
    var target_name;

    if(target_owner == 'professor'){
      mouse.owner = 'professor';
      target_name = 'prof_' + mouse.cur_prof_page;
      document.getElementById("prof_page").style.visibility='visible';
      document.getElementById("stud_page").style.visibility='hidden';
      canvas_main.style.pointerEvents='none';
      for (var i = 0; i < hide_button.length; i++){
        hide_button[i].style.visibility='hidden';
      }
    }else if(target_owner == 'student'){
      mouse.owner = 'student';
      target_name = 'stud_' + mouse.cur_stud_page;
      document.getElementById("prof_page").style.visibility='hidden';
      document.getElementById("stud_page").style.visibility='visible';
      canvas_main.style.pointerEvents='auto';
      for (var i = 0; i < hide_button.length; i++){
        hide_button[i].style.visibility='visible';
      }
    }
    var src_canvas = document.getElementById(target_name);
    ctx_main.clearRect(0, 0, width, height);
    ctx_main.drawImage(src_canvas, 0, 0);
    checkPrevNext();
  }
  function onPageControl(e, v){
    if(e){
      var control = e.target.className.split(' ')[1];
    }else{
      var control = v;
    }

    // 교수의 다음 페이지가 없을 때, 페이지 추가
    if(control == 'next' && user_type == 'professor' && !checkPrevNext('next')){
      ctx_main.clearRect(0, 0, width, height);
      document.getElementById("prof_"+mouse.cur_prof_page).classList.remove('selected');
      mouse.cur_prof_page++;
      var target_list = document.getElementById("prof_canvas_list");
      var new_canvas = document.createElement("canvas");
      new_canvas.className = 'prof_canvas_element';
      new_canvas.width = width;
      new_canvas.height = height;
      addEventToCanvas(new_canvas);
      new_canvas.setAttribute('id', 'prof_' + mouse.cur_prof_page);
      new_canvas.setAttribute( 'draggable', 'true' );
      new_canvas.classList.add('selected');
      target_list.appendChild(new_canvas);
      new_canvas.scrollIntoView();
      socket.emit('newPage', { course_name: course_name, page: mouse.cur_prof_page } );
      checkPrevNext();  // 교수의 다음 페이지가 있을 때, 다음 페이지 로드
    }else if(control == 'next' && user_type == 'professor' && checkPrevNext('next')){
      document.getElementById("prof_"+mouse.cur_prof_page).classList.remove('selected');
      mouse.cur_prof_page++;
      var src_canvas = document.getElementById('prof_' + mouse.cur_prof_page);
      src_canvas.classList.add('selected');
      src_canvas.scrollIntoView();
      ctx_main.clearRect(0, 0, width, height);
      ctx_main.drawImage(src_canvas, 0, 0);
      checkPrevNext();  //교수의 이전 페이지가 있을 때, 이전 페이지 로드
    }else if(control == 'prev' && user_type == 'professor' && checkPrevNext('prev')){
      document.getElementById("prof_"+mouse.cur_prof_page).classList.remove('selected');
      mouse.cur_prof_page--;
      var src_canvas = document.getElementById('prof_' + mouse.cur_prof_page);
      src_canvas.classList.add('selected');
      src_canvas.scrollIntoView();
      ctx_main.clearRect(0, 0, width, height);
      ctx_main.drawImage(src_canvas, 0, 0);
      checkPrevNext();  // 학생의 다음 페이지가 없을 때, 페이지 추가
    }else if(control == 'next' && user_type == 'student' && mouse.owner == 'student' && !checkPrevNext('next')){
      ctx_main.clearRect(0, 0, width, height);
      document.getElementById("stud_"+mouse.cur_stud_page).classList.remove('selected');
      mouse.cur_stud_page++;
      var target_list = document.getElementById("stud_canvas_list");
      var new_canvas = document.createElement("canvas");
      new_canvas.className = 'stud_canvas_element';
      new_canvas.width = width;
      new_canvas.height = height;
      addEventToCanvas(new_canvas);
      new_canvas.setAttribute('id', 'stud_' + mouse.cur_stud_page);
      new_canvas.setAttribute( 'draggable', 'true' );
      new_canvas.classList.add('selected');
      target_list.appendChild(new_canvas);
      new_canvas.scrollIntoView();
      socket.emit('newPage', { course_name: course_name, page: mouse.cur_stud_page } );
      checkPrevNext();  //학생의 다음 페이지가 있을 때, 다음 페이지 로드
    }else if(control == 'next' && user_type == 'student' && checkPrevNext('next')){
      var src_canvas;
      if(mouse.owner == 'professor'){
        document.getElementById("prof_"+mouse.cur_prof_page).classList.remove('selected');
        mouse.cur_prof_page++;
        src_canvas = document.getElementById('prof_' + mouse.cur_prof_page);
      }else if(mouse.owner == 'student'){
        document.getElementById("stud_"+mouse.cur_stud_page).classList.remove('selected');
        mouse.cur_stud_page++;
        src_canvas = document.getElementById('stud_' + mouse.cur_stud_page);
      }
      src_canvas.classList.add('selected');
      src_canvas.scrollIntoView();
      ctx_main.clearRect(0, 0, width, height);
      ctx_main.drawImage(src_canvas, 0, 0);
      checkPrevNext();  //학생의 이전 페이지가 있을 때, 이전 페이지 로드
    }else if(control == 'prev' && user_type == 'student' && checkPrevNext('prev')){
      var src_canvas;
      if(mouse.owner == 'professor'){
        document.getElementById("prof_"+mouse.cur_prof_page).classList.remove('selected');
        mouse.cur_prof_page--;
        src_canvas = document.getElementById('prof_' + mouse.cur_prof_page);
      }else if(mouse.owner == 'student'){
        document.getElementById("stud_"+mouse.cur_stud_page).classList.remove('selected');
        mouse.cur_stud_page--;
        src_canvas = document.getElementById('stud_' + mouse.cur_stud_page);
      }
      src_canvas.classList.add('selected');
      src_canvas.scrollIntoView();
      ctx_main.clearRect(0, 0, width, height);
      ctx_main.drawImage(src_canvas, 0, 0);
      checkPrevNext();
    }else if(control == 'btn_plus' && !checkPrevNext('next')){  // 다음 페이지 없을 때 플러스 버튼, 페이지 없을 때의 next와 동일
      onPageControl(false, 'next');
    }else if(control == 'btn_plus' && user_type == 'professor' && checkPrevNext('next')){  // 교수의 다음 페이지 있을 때 플러스 버튼, 페이지 순서 재정렬
      var ref_canvas = document.getElementById('prof_' + mouse.cur_prof_page);
      var new_canvas = document.createElement("canvas");
      var canvas_all = document.getElementsByClassName("prof_canvas_element");
      document.getElementById("prof_"+mouse.cur_prof_page).classList.remove('selected');
      mouse.cur_prof_page++;
      for(var i=canvas_all.length; i>=mouse.cur_prof_page; i--){
        canvas_all[i-1].setAttribute('id', 'prof_'+(i+1));
      }
      new_canvas.className = 'prof_canvas_element';
      new_canvas.width = width;
      new_canvas.height = height;
      addEventToCanvas(new_canvas);
      new_canvas.setAttribute('id', 'prof_' + mouse.cur_prof_page);
      new_canvas.setAttribute( 'draggable', 'true' );
      new_canvas.classList.add('selected');
      insertAfter(ref_canvas, new_canvas);
      new_canvas.scrollIntoView();
      ctx_main.clearRect(0, 0, width, height);
      checkPrevNext();
      socket.emit('newPage', { course_name: course_name, page: mouse.cur_prof_page } );
    }else if(control == 'btn_plus' && user_type == 'student' && checkPrevNext('next')){ //학생의 다음 페이지가 있을 때 플러스 버튼, 페이지 순서 재정렬
      var ref_canvas = document.getElementById('stud_' + mouse.cur_stud_page);
      var new_canvas = document.createElement("canvas");
      var canvas_all = document.getElementsByClassName("stud_canvas_element");
      document.getElementById("stud_"+mouse.cur_stud_page).classList.remove('selected');
      mouse.cur_stud_page++;
      for(var i=canvas_all.length; i>=mouse.cur_stud_page; i--){
        canvas_all[i-1].setAttribute('id', 'stud_'+(i+1));
      }
      new_canvas.className = 'stud_canvas_element';
      new_canvas.width = width;
      new_canvas.height = height;
      addEventToCanvas(new_canvas);
      new_canvas.setAttribute('id', 'stud_' + mouse.cur_stud_page);
      new_canvas.setAttribute( 'draggable', 'true' );
      new_canvas.classList.add('selected');
      insertAfter(ref_canvas, new_canvas);
      new_canvas.scrollIntoView();
      ctx_main.clearRect(0, 0, width, height);
      checkPrevNext();
      socket.emit('newPage', { course_name: course_name, page: mouse.cur_stud_page } );
    }else if(control == 'btn_minus' && user_type == 'professor' && mouse.cur_prof_page <= 1){ // 교수의 현재 페이지가 1일 때  페이지 삭제 버튼, 페이지 clear와 동일
      onToolUpdate(false, 'clear');
    }else if(control == 'btn_minus' && user_type == 'student' && mouse.cur_stud_page <= 1){ // 학생의 현재 페이지가 1일 때  페이지 삭제 버튼, 페이지 clear와 동일
      onToolUpdate(false, 'clear');
    }else if(control == 'btn_minus' && user_type == 'professor' && mouse.cur_prof_page > 1){ // 교수의 현재 페이지가 1보다 클 때, 해당 캔버스 삭제 & 재정렬
      var target_canvas = document.getElementById('prof_'+ mouse.cur_prof_page);
      target_canvas.parentElement.removeChild(target_canvas);

      var canvas_all = document.getElementsByClassName("prof_canvas_element");
      for(var i=mouse.cur_prof_page-1; i<canvas_all.length; i++){
        canvas_all[i].setAttribute('id', 'prof_'+(i+1));
      }
      socket.emit('delPage', { course_name: course_name, page: mouse.cur_prof_page } );
      if(canvas_all.length<mouse.cur_prof_page){
        mouse.cur_prof_page--;
      }
      var src_canvas = document.getElementById('prof_' + mouse.cur_prof_page);
      src_canvas.classList.add('selected');
      src_canvas.scrollIntoView();
      ctx_main.clearRect(0, 0, width, height);
      ctx_main.drawImage(src_canvas, 0, 0);
      checkPrevNext();
    }else if(control == 'btn_minus' && user_type == 'student' && mouse.cur_stud_page > 1){ // 학생의 현재 페이지가 1보다 클 때, 해당 캔버스 삭제 & 재정렬
      var target_canvas = document.getElementById('stud_'+ mouse.cur_stud_page);
      target_canvas.parentElement.removeChild(target_canvas);

      var canvas_all = document.getElementsByClassName("stud_canvas_element");
      for(var i=mouse.cur_stud_page-1; i<canvas_all.length; i++){
        canvas_all[i].setAttribute('id', 'stud_'+(i+1));
      }
      socket.emit('delPage', { course_name: course_name, page: mouse.cur_stud_page } );
      if(canvas_all.length<mouse.cur_stud_page){
        mouse.cur_stud_page--;
      }
      var src_canvas = document.getElementById('stud_' + mouse.cur_stud_page);
      src_canvas.classList.add('selected');
      src_canvas.scrollIntoView();
      ctx_main.clearRect(0, 0, width, height);
      ctx_main.drawImage(src_canvas, 0, 0);
      checkPrevNext();
    }
  }

  // 소켓 수신 처리
  socket.on('endGetboard', function () {
    checkPrevNext();
  });

  socket.on('drawLine', function (data) {
    var target_list;
    var target_id;
    var target_canvas;
    var target_ctx;
    var class_name;

    if(data.owner == 'professor'){
      target_list = document.getElementById("prof_canvas_list");
      target_id = 'prof_' + data.page;
      class_name = 'prof_canvas_element';
    } else if(data.owner == 'student'){
      target_list = document.getElementById("stud_canvas_list");
      target_id = 'stud_' + data.page;
      class_name = 'stud_canvas_element';
    }
    target_canvas = document.getElementById(target_id);

    if(!target_canvas){ // 해당 페이지가 없다면,
      target_canvas = document.createElement("canvas");
      target_canvas.className = class_name;
      target_canvas.width = width;
      target_canvas.height = height;
      addEventToCanvas(target_canvas);
      target_canvas.setAttribute('id', target_id);
      if(!(user_type == 'student' && data.owner == 'professor')){ // 학생 계정으로 교수 캔버스 드래그 불가 처리
        target_canvas.setAttribute( 'draggable', 'true' );
      }
      target_list.appendChild(target_canvas);
      checkPrevNext();
    }
    target_ctx = target_canvas.getContext('2d');

    // 수신 페이지와 현재 페이지가 같다면 main canvas에 그리기
    if((data.owner == 'professor' && mouse.owner == 'professor' && data.page == mouse.cur_prof_page) || (data.owner == 'student' && mouse.owner == 'student' && data.page == mouse.cur_stud_page)){
      for(var i in data.line){
        drawLine(data.line[i].prev_pos.x, data.line[i].prev_pos.y, data.line[i].cur_pos.x, data.line[i].cur_pos.y, data.line[i].tool, data.line[i].color, data.line[i].width, ctx_main, false);
      }
    }
    //  수신 페이지를 해당 owner의 미니 페이지에 그리기
    for(var i in data.line){
      drawLine(data.line[i].prev_pos.x, data.line[i].prev_pos.y, data.line[i].cur_pos.x, data.line[i].cur_pos.y, data.line[i].tool, data.line[i].color, data.line[i].width, target_ctx, false);
    }
  });

  socket.on('newPage', function (data) {
    var ref_canvas = document.getElementById('prof_' + (data.page-1));
    var new_canvas = document.createElement("canvas");
    var canvas_all = document.getElementsByClassName("prof_canvas_element");
    for(var i=canvas_all.length; i>=data.page; i--){
      canvas_all[i-1].setAttribute('id', 'prof_'+(i+1));
    }
    new_canvas.className = 'prof_canvas_element';
    new_canvas.width = width;
    new_canvas.height = height;
    addEventToCanvas(new_canvas);
    new_canvas.setAttribute('id', 'prof_' + data.page);
    insertAfter(ref_canvas, new_canvas);
    /* 판서 동기화 설정시 스크롤 트레이스 코드 추가 */
    checkPrevNext();
  });

  socket.on('clear', function (data) {
    if(( mouse.owner == 'professor' && data.page == mouse.cur_prof_page)){
      ctx_main.clearRect(0, 0, width, height);
      var ctx_prof = document.getElementById('prof_'+data.page).getContext('2d');
      ctx_prof.clearRect(0, 0, width, height);
    }
  });

  socket.on('delPage', function (data) {
    var target_canvas = document.getElementById('prof_'+ data.page);
    target_canvas.parentElement.removeChild(target_canvas);

    var canvas_all = document.getElementsByClassName("prof_canvas_element");
    for(var i=data.page-1; i<canvas_all.length; i++){
      canvas_all[i].setAttribute('id', 'prof_'+(i+1));
    }

    if(mouse.owner == 'professor' && mouse.cur_prof_page == data.page){
      if(canvas_all.length<mouse.cur_prof_page){
        mouse.cur_prof_page--;
      }
      var src_canvas = document.getElementById('prof_' + mouse.cur_prof_page);
      src_canvas.scrollIntoView();
      ctx_main.clearRect(0, 0, width, height);
      ctx_main.drawImage(src_canvas, 0, 0);
    }else if(mouse.owner == 'professor' && mouse.cur_prof_page > data.page){
      mouse.cur_prof_page--;
    }
    checkPrevNext();
  });

  socket.on('changeOrder', function (data) {
    //{from: , to:}
  });

  function drawLine(x0, y0, x1, y1, tool, color, _width, ctx, emit){
    if(tool == 'pen'){
      ctx.globalCompositeOperation = 'source-over';
    }else if(tool == 'eraser'){
      ctx.globalCompositeOperation = 'destination-out';
    }
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = _width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    if (emit) {
      if(user_type == 'professor'){ var e_page = mouse.cur_prof_page; }
      else if(user_type == 'student'){ var e_page = mouse.cur_stud_page; }
      socket.emit('drawLine', { line: {prev_pos: {x:x0, y:y0}, cur_pos: {x:x1, y:y1}, tool: tool, color: color, width: _width}, course_name: course_name, page: e_page });
    }
  }

  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  // 터치로 인한 스크롤 방지
  document.body.addEventListener('touchstart',function(evt){
    evt.preventDefault();
  },false);

  document.body.addEventListener('touchmove',function(evt){
    evt.preventDefault();
  },false);

  document.body.addEventListener('touchend',function(evt){
    evt.preventDefault();
  },false);

  /*  selCanvas(e)
    func: 미니 캔버스 선택 처리
    input: x
    return: x
  */
  function selCanvas(e){
    var target_canvas = e.target;
    var target_num = Number(e.target.id.split('_')[1]);
    var src_canvas;
    target_canvas.classList.add('selected');
    if(mouse.owner == 'professor'){
      document.getElementById("prof_"+mouse.cur_prof_page).classList.remove('selected');
      mouse.cur_prof_page = target_num;
      src_canvas = document.getElementById('prof_' + mouse.cur_prof_page);
    }else if(mouse.owner == 'student'){
      document.getElementById("stud_"+mouse.cur_stud_page).classList.remove('selected');
      mouse.cur_stud_page = target_num;
      src_canvas = document.getElementById('stud_' + mouse.cur_stud_page);
    }

    src_canvas.classList.add('selected');
    ctx_main.clearRect(0, 0, width, height);
    ctx_main.drawImage(src_canvas, 0, 0);
    checkPrevNext();
  }

  /*  addEventToCanvas(canvas)
    func: 새로운 미니 캔버스에 클릭, 드래그 이벤트 리스너 등록
    input: 대상 canvas 객체
    return: x
  */
  function addEventToCanvas(canvas){
    canvas.addEventListener('mouseup', selCanvas, false);
    canvas.addEventListener('touchend', selCanvas, false);
    canvas.addEventListener('dragstart', dragstart, false);
    canvas.addEventListener('dragover', dragover, false);
    canvas.addEventListener('dragenter', dragenter, false);
    canvas.addEventListener('dragleave', dragleave, false);
    canvas.addEventListener('drop', drop, false);
  }

/*  checkPrevNext(opt)
  func: mouse.owner에 기록된 대상의 현재기준 다음 페이지, 이전 페이지 유무 확인
        유무에 따라 페이지 인터페이스 visible - hidden 토글
        현재 페이지 번호 출력
  input: null, next, prev
  return: 이전, 다음 페이지 canvas의 엘리먼트
*/
  function checkPrevNext(opt){
    var target_name;
    var target_cur_num;
    var target_id;

    if(mouse.owner == 'professor'){
      target_name = 'prof_';
      target_cur_num = mouse.cur_prof_page;
    }else if(mouse.owner == 'student'){
      target_name = 'stud_';
      target_cur_num = mouse.cur_stud_page;
    }

    if(opt == 'next'){
      target_id = target_name + String(target_cur_num + 1);
      return document.getElementById(target_id);
    }else if(opt == 'prev'){
      target_id = target_name + String(target_cur_num - 1);
      return document.getElementById(target_id);
    }else{
      html_page_tag.innerHTML = target_cur_num;

      target_id = target_name + String(target_cur_num + 1)
      if(document.getElementById(target_id)){  // 다음 페이지가 있으면,
        html_next_tag.style.visibility = 'visible';
        html_next_tag.innerHTML = '>';
      }else{  // 다음 페이지가 없으면,
        if(user_type == mouse.owner){
          html_next_tag.style.visibility = 'visible';
          html_next_tag.innerHTML = '+';
        }else{
          html_next_tag.style.visibility = 'hidden';
        }
      }

      target_id = target_name + String(target_cur_num - 1)
      if(document.getElementById(target_id)){  // 이전 페이지가 있으면,
        html_prev_tag.style.visibility='visible';
      }else{  // 이전 페이지가 없으면,
        html_prev_tag.style.visibility='hidden';
      }
    }
  }

  function dragstart(e) {
    e.dataTransfer.setData('data_id', e.target.id);
  }

  function dragover(e) {
    e.preventDefault();
  }

  function dragenter(e) {
    e.preventDefault();
    e.target.classList.add('selected');
  }

  function dragleave(e) {
    e.target.classList.remove('selected');
  }

  function drop(e) {
    var data_id = e.dataTransfer.getData('data_id');
    if(e.target.id == data_id){
      return;
    }

    if(user_type == 'professor'){
      var target_canvas_element = 'prof_canvas_element';
      var id_name = 'prof_';
      var cur_page = mouse.cur_prof_page;
    }else if(user_type == 'student'){
      var target_canvas_element = 'stud_canvas_element';
      var id_name = 'stud_';
      var cur_page = mouse.cur_stud_page;
    }

    var from_canvas = document.getElementById(data_id);

    /* 캔버스 이름 재정렬 */ //주황 select 고치기 & 서버단 처리 추가 emit
    var from_id = Number(data_id.split('_')[1]);
    var to_id = Number(e.target.id.split('_')[1]);
    from_canvas.setAttribute('id', 'temp');
    var canvas_all = document.getElementsByClassName(target_canvas_element);
    if(from_id < to_id){
      for(var i=from_id; i<to_id; i++){
        canvas_all[i].setAttribute('id', id_name+i);
      }
      from_canvas.setAttribute('id', id_name+to_id);
      insertAfter(e.target, from_canvas);
    }else if(from_id > to_id){
      for(var i=from_id; i>to_id; i--){
        canvas_all[i-2].setAttribute('id', id_name+i);
      }
      from_canvas.setAttribute('id', id_name+(to_id));
      insertBefore(e.target, from_canvas);
    }

    e.target.classList.remove('selected');
    if(cur_page == from_id){
      canvas_all[to_id-1].classList.add('selected');
      if(user_type == 'professor'){
        mouse.cur_prof_page = to_id;
      }else if('student'){
        mouse.cur_stud_page = to_id;
      }
      checkPrevNext();
    }
  }
});

/* insertAfter(referenceNode, el)
  func: 특정 html 요소 뒤에 새로운 태그 추가
  input: node1, node2
  return: None
*/
function insertAfter(referenceNode, el) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function insertBefore(referenceNode, el) {
  referenceNode.parentNode.insertBefore(el, referenceNode);
}

/*  getParam(sname)
  func: URL 파라미터 값 반환
  input: 대상 파라미터 이름
  return: 대상 파리미터 값
*/
function getParam(sname) {
  var url = decodeURIComponent(location.href);
  url = decodeURIComponent(url);

  var params = url.substr(url.indexOf("?") + 1);
  var sval = "";
  params = params.split("&");
  for (var i = 0; i < params.length; i++) {
    temp = params[i].split("=");
    if ([temp[0]] == sname) { sval = temp[1]; }
  }
  return sval;
}
