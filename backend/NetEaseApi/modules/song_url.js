// 歌曲链接
module.exports = async (query, request) => {
  console.log('查询歌曲链接的请求进来了.....');
  query.cookie.os = "pc";
  const ids = query.id.split(",");
  const data = {
    ids: JSON.stringify(ids),
    br: parseInt(query.br || 999000),
  };

  const res = await request(
    "POST",
    `https://interface3.music.163.com/eapi/song/enhance/player/url`,
    data,
    {
      crypto: "eapi",
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
      url: "/api/song/enhance/player/url",
    }
  );

  // res.body不能直接取data属性，否则会出现未捕获的异常信息，因为请求失败的时候：res.body就没有data属性
  // 所以这里需要做个判断，提前捕获到这个异常，并把它抛出去，否则后面的代码就会出现未捕获的异常，很难排查
  if (res.body.code != 200 ) {
    // 注意这里new Error的参数不能是对象，而必须是字符串！！！所以res.body必须通过JSON.stringify转成字符串
    throw new Error(JSON.stringify(res.body))  
  }
  // 根据id排序
  const result = res.body.data;
  console.log("get Song url res==>",res)
  result.sort((a, b) => {
    return ids.indexOf(String(a.id)) - ids.indexOf(String(b.id));
  });
  return {
    status: 200,
    body: {
      code: 200,
      data: result,
    },
  };

};
