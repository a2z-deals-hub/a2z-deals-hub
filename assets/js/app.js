fetch("data/posts.json")
  .then(res => res.json())
  .then(posts => {
    const blogList = document.getElementById("blog-list");
    posts.forEach(post => {
      const div = document.createElement("div");
      div.className = "blog-card";
      div.innerHTML = `
        <h2><a href="${post.url}">${post.title}</a></h2>
        <p class="date">${post.date}</p>
        <p>${post.excerpt}</p>
        <a href="${post.url}" class="read-more">Read More</a>
      `;
      blogList.appendChild(div);
    });
  });
