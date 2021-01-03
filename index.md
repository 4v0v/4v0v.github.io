---
layout: default
---

# 4v0v's website


{% for post in site.posts %}
<div>
		<span>
				{% include date.html %}
				&raquo;
				<a href="{{ post.url | prepend: site.baseurl }}"> {{ post.title }} </a>
		</span>
</div>
{% endfor %}


{% assign drawings = site.static_files | where: 'is_drawing', true %}
{% for drawing in drawings %}
  <div>{{ drawing.path }}</div>
{% endfor %}
