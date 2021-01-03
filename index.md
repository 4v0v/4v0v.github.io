---
layout: default
---

# 4v0v's website


{% for post in site.posts %}
<div class="media t-hackcss-media">
    <div class="media-body">
        <span>
            {% include date.html %}
            &raquo;
            <a href="{{ post.url | prepend: site.baseurl }}"> {{ post.title }} </a>
        </span>
    </div>
</div>
{% endfor %}