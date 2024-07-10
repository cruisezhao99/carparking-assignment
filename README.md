answer one: 
   carparking 数据表结构在sql 目录下。

answer two:
   carpark_process_csv.js

answer three:
    api 接口程序： carpark_queryfilter.js
    
    run : node carpark_queryfilter.js
    
    then browser to open http://localhost:3000/api-docs, get Swagger docs


获取筛选后的停车场列表：


   fetch('/carparks?freeParking=true&nightParking=true&minHeight=2.0')
  .then(response => response.json())
  .then(data => {
    // 处理返回的停车场数据
  });

  

  添加停车场到收藏夹：
  
  fetch('/favourites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 1, carParkId: 123 })
})
  .then(response => response.json())
  .then(data => {
    // 处理添加收藏的结果
  });
