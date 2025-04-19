---
layout: jupyter-notebook
title: What Racquet Is That?  
subtitle: 'Training a Deep Learning Model to Distinguish Between Lookalike Sports Gear'
tags: [deep learning, computer vision, image classification, fastai, pytorch, machine learning projects]
---

<div class="jp-Notebook" data-jp-theme-light="true" data-jp-theme-name="JupyterLab Light">
<main>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=098a72f1">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>
In this project, we train a deep learning model to recognize four types of sports racquets - badminton, tennis, squash and pickleball. They may look similar, but telling them apart can actually be quite tricky! This blog post is based on a hands-on <strong>Jupyter Notebook</strong>, so you can follow along or try it out yourself. The link to the Jupyter Notebook is shared at the bottom of the page.
</p>
<p>This end-to-end notebook walks through:
</p>
<ul>
<li><strong>Data collection</strong> (including automated image scraping),</li>
<li><strong>Model training and tuning</strong> using <code>resnet34</code>,</li>
<li><strong>Interpreting loss and error metrics</strong> the fastai way,</li>
<li><strong>Testing on unseen images</strong> with manual labeling,</li>
<li>And finally, <strong>saving the model</strong> for future use.</li>
</ul>
<p>The goal isn't just to build a working classifier — it's to <strong>understand the process</strong>, reason through decisions and lay the foundation for more complex computer vision projects down the line.</p>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=3d820b86">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Setup-Instructions">Setup Instructions<a class="anchor-link" href="#Setup-Instructions">¶</a></h3><p>Run the following commands in your terminal to install the necessary dependencies:</p>
<p><code>pip install fastai duckduckgo_search</code></p>
<ul>
<li><strong>fastai</strong> is a high-level deep learning library built on top of PyTorch, which we will use to train and evaluate our racquet image classifier.</li>
</ul>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell" id="cell-id=83d7bba9">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [3]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="c1"># Check for fastai dependencies</span>
<span class="kn">import</span><span class="w"> </span><span class="nn">sys</span>

<span class="k">try</span><span class="p">:</span>
    <span class="kn">from</span><span class="w"> </span><span class="nn">fastai.vision.all</span><span class="w"> </span><span class="kn">import</span> <span class="o">*</span>
    <span class="nb">print</span><span class="p">(</span><span class="s2">"fastai is installed."</span><span class="p">)</span>
<span class="k">except</span> <span class="ne">ImportError</span><span class="p">:</span>
    <span class="nb">print</span><span class="p">(</span><span class="s2">"fastai not found. Please install it via: pip install fastai"</span><span class="p">)</span>
    <span class="n">sys</span><span class="o">.</span><span class="n">exit</span><span class="p">(</span><span class="mi">1</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
<div class="jp-Cell-outputWrapper">
<div class="jp-Collapser jp-OutputCollapser jp-Cell-outputCollapser">
</div>
<div class="jp-OutputArea jp-Cell-outputArea">
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre>fastai is installed.
</pre>
</div>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs" id="cell-id=83b986ef">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [7]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="c1"># Define racquet categories</span>
<span class="c1"># These names will be passed in the image search request and used to create folders for the images</span>
<span class="n">sports</span> <span class="o">=</span> <span class="p">[</span><span class="s2">"tennis racquet"</span><span class="p">,</span> <span class="s2">"badminton racquet"</span><span class="p">,</span> <span class="s2">"squash racquet"</span><span class="p">,</span> <span class="s2">"pickleball racquet"</span><span class="p">]</span>

<span class="c1"># Base image directory</span>
<span class="n">base_dir</span> <span class="o">=</span> <span class="n">Path</span><span class="p">(</span><span class="s2">"images"</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=92ca0237">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Create-folders-where-images-will-be-downloaded">Create folders where images will be downloaded<a class="anchor-link" href="#Create-folders-where-images-will-be-downloaded">¶</a></h3><p>Note: Run the below cell only once, else you may delete all the downloaded images. You will have to download them all again.</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs" id="cell-id=dc27fb0c">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [ ]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="kn">from</span><span class="w"> </span><span class="nn">pathlib</span><span class="w"> </span><span class="kn">import</span> <span class="n">Path</span>
<span class="kn">import</span><span class="w"> </span><span class="nn">shutil</span>

<span class="c1"># Clean up and create folders</span>
<span class="k">for</span> <span class="n">item</span> <span class="ow">in</span> <span class="n">sports</span><span class="p">:</span>
    <span class="n">sport_folder</span> <span class="o">=</span> <span class="n">item</span><span class="o">.</span><span class="n">split</span><span class="p">()[</span><span class="mi">0</span><span class="p">]</span><span class="o">.</span><span class="n">lower</span><span class="p">()</span>  <span class="c1"># Get 'tennis' from 'tennis racquet'</span>
    <span class="n">folder</span> <span class="o">=</span> <span class="n">base_dir</span> <span class="o">/</span> <span class="n">sport_folder</span>
    <span class="k">if</span> <span class="n">folder</span><span class="o">.</span><span class="n">exists</span><span class="p">():</span>
        <span class="n">shutil</span><span class="o">.</span><span class="n">rmtree</span><span class="p">(</span><span class="n">folder</span><span class="p">)</span>
        <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"Removed existing folder: </span><span class="si">{</span><span class="n">folder</span><span class="o">.</span><span class="n">resolve</span><span class="p">()</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>
        
    <span class="n">folder</span><span class="o">.</span><span class="n">mkdir</span><span class="p">(</span><span class="n">parents</span><span class="o">=</span><span class="kc">True</span><span class="p">,</span> <span class="n">exist_ok</span><span class="o">=</span><span class="kc">True</span><span class="p">)</span>
    <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"Created folder: </span><span class="si">{</span><span class="n">folder</span><span class="o">.</span><span class="n">resolve</span><span class="p">()</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=da65fd61">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Downloading-Racquet-Images">Downloading Racquet Images<a class="anchor-link" href="#Downloading-Racquet-Images">¶</a></h3><p>In the next step, we will download 300 images for each racquet category using the <code>duckduckgo_search</code> library. Although the images are ultimately sourced from Bing, we're using the DuckDuckGo interface to bypass the bot protection, rate limiting, and API key restrictions that come with direct access to Bing or Google.</p>
<p>DuckDuckGo itself leverages Bing under the hood for image search results (reference: <a href="https://news.ycombinator.com/item?id=23458202">Hacker News</a>). When you search for images on DuckDuckGo in a browser, the content is silently fetched from Bing, often proxied through DDG to enhance user privacy.</p>
<p>This approach is fine atleast for our small scale and non-commercial project.</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs" id="cell-id=447e1a4e">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [23]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="kn">import</span><span class="w"> </span><span class="nn">time</span><span class="o">,</span><span class="w"> </span><span class="nn">requests</span>
<span class="kn">from</span><span class="w"> </span><span class="nn">pathlib</span><span class="w"> </span><span class="kn">import</span> <span class="n">Path</span>
<span class="kn">from</span><span class="w"> </span><span class="nn">duckduckgo_search</span><span class="w"> </span><span class="kn">import</span> <span class="n">DDGS</span>
<span class="kn">from</span><span class="w"> </span><span class="nn">PIL</span><span class="w"> </span><span class="kn">import</span> <span class="n">Image</span>
<span class="kn">from</span><span class="w"> </span><span class="nn">io</span><span class="w"> </span><span class="kn">import</span> <span class="n">BytesIO</span>
<span class="kn">from</span><span class="w"> </span><span class="nn">PIL</span><span class="w"> </span><span class="kn">import</span> <span class="n">ImageOps</span>

<span class="n">MAX_SIZE</span> <span class="o">=</span> <span class="mi">400</span> <span class="c1">#pixel size</span>
<span class="n">DELAY</span> <span class="o">=</span> <span class="mf">0.5</span> <span class="c1">#seconds</span>

<span class="c1"># Validate image bytes (not corrupted)</span>
<span class="k">def</span><span class="w"> </span><span class="nf">is_valid_image</span><span class="p">(</span><span class="n">img_bytes</span><span class="p">):</span>
    <span class="k">try</span><span class="p">:</span>
        <span class="n">img</span> <span class="o">=</span> <span class="n">Image</span><span class="o">.</span><span class="n">open</span><span class="p">(</span><span class="n">BytesIO</span><span class="p">(</span><span class="n">img_bytes</span><span class="p">))</span>
        <span class="n">img</span><span class="o">.</span><span class="n">verify</span><span class="p">()</span>  <span class="c1"># Check corruption</span>

        <span class="c1"># Re-open the image to access dimensions and file type</span>
        <span class="c1"># This is necessary because verify() doesn't load the image data</span>
        <span class="c1"># Refer: https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.Image.verify</span>

        <span class="n">img</span> <span class="o">=</span> <span class="n">Image</span><span class="o">.</span><span class="n">open</span><span class="p">(</span><span class="n">BytesIO</span><span class="p">(</span><span class="n">img_bytes</span><span class="p">))</span>  

        <span class="k">if</span> <span class="n">img</span><span class="o">.</span><span class="n">width</span> <span class="o">&lt;</span> <span class="mi">200</span> <span class="ow">or</span> <span class="n">img</span><span class="o">.</span><span class="n">height</span> <span class="o">&lt;</span> <span class="mi">200</span><span class="p">:</span>
            <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"Image too small: </span><span class="si">{</span><span class="n">img</span><span class="o">.</span><span class="n">width</span><span class="si">}</span><span class="s2">x</span><span class="si">{</span><span class="n">img</span><span class="o">.</span><span class="n">height</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>
            <span class="k">return</span> <span class="kc">False</span>
        
        <span class="k">return</span> <span class="kc">True</span>
    <span class="k">except</span> <span class="ne">Exception</span><span class="p">:</span>
        <span class="k">return</span> <span class="kc">False</span>

<span class="c1"># Main download function</span>
<span class="k">def</span><span class="w"> </span><span class="nf">download_images_bing</span><span class="p">(</span><span class="n">query</span><span class="p">,</span> <span class="n">folder_path</span><span class="p">,</span> <span class="n">max_images</span><span class="p">):</span>
    <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"</span><span class="se">\n</span><span class="s2">~~~ Searching for: </span><span class="si">{</span><span class="n">query</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>
    <span class="n">count</span> <span class="o">=</span> <span class="mi">0</span>

    <span class="k">with</span> <span class="n">DDGS</span><span class="p">()</span> <span class="k">as</span> <span class="n">ddgs</span><span class="p">:</span>
        <span class="n">results</span> <span class="o">=</span> <span class="n">ddgs</span><span class="o">.</span><span class="n">images</span><span class="p">(</span><span class="n">query</span><span class="p">,</span> <span class="n">max_results</span><span class="o">=</span><span class="n">max_images</span><span class="p">)</span>
        <span class="k">for</span> <span class="n">result</span> <span class="ow">in</span> <span class="n">results</span><span class="p">:</span>
            <span class="n">url</span> <span class="o">=</span> <span class="n">result</span><span class="o">.</span><span class="n">get</span><span class="p">(</span><span class="s2">"image"</span><span class="p">)</span>
            <span class="k">if</span> <span class="ow">not</span> <span class="n">url</span><span class="p">:</span>
                <span class="k">continue</span>

            <span class="k">try</span><span class="p">:</span>
                <span class="n">response</span> <span class="o">=</span> <span class="n">requests</span><span class="o">.</span><span class="n">get</span><span class="p">(</span><span class="n">url</span><span class="p">,</span> <span class="n">timeout</span><span class="o">=</span><span class="mi">10</span><span class="p">)</span>
                <span class="n">response</span><span class="o">.</span><span class="n">raise_for_status</span><span class="p">()</span>
                <span class="n">img_bytes</span> <span class="o">=</span> <span class="n">response</span><span class="o">.</span><span class="n">content</span>

                <span class="k">if</span> <span class="ow">not</span> <span class="n">is_valid_image</span><span class="p">(</span><span class="n">img_bytes</span><span class="p">):</span>
                    <span class="k">continue</span>  

                
                <span class="n">img</span> <span class="o">=</span> <span class="n">Image</span><span class="o">.</span><span class="n">open</span><span class="p">(</span><span class="n">BytesIO</span><span class="p">(</span><span class="n">img_bytes</span><span class="p">))</span>
                <span class="n">file_ext</span> <span class="o">=</span> <span class="n">img</span><span class="o">.</span><span class="n">format</span><span class="o">.</span><span class="n">lower</span><span class="p">()</span>
                <span class="k">if</span> <span class="n">file_ext</span> <span class="ow">not</span> <span class="ow">in</span> <span class="p">[</span><span class="s2">"jpeg"</span><span class="p">,</span> <span class="s2">"jpg"</span><span class="p">,</span> <span class="s2">"png"</span><span class="p">]:</span>
                    <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"Unsupported image format: </span><span class="si">{</span><span class="n">file_ext</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>
                    <span class="k">continue</span>

                <span class="c1">#resize the images greater than MAX_SIZE to MAX_SIZE     </span>
                <span class="n">img</span> <span class="o">=</span> <span class="n">Image</span><span class="o">.</span><span class="n">open</span><span class="p">(</span><span class="n">BytesIO</span><span class="p">(</span><span class="n">img_bytes</span><span class="p">))</span>       
                <span class="k">if</span> <span class="n">img</span><span class="o">.</span><span class="n">width</span> <span class="o">&gt;</span> <span class="n">MAX_SIZE</span> <span class="ow">or</span> <span class="n">img</span><span class="o">.</span><span class="n">height</span> <span class="o">&gt;</span> <span class="n">MAX_SIZE</span><span class="p">:</span>
                    <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"Resizing image: </span><span class="si">{</span><span class="n">img</span><span class="o">.</span><span class="n">width</span><span class="si">}</span><span class="s2">x</span><span class="si">{</span><span class="n">img</span><span class="o">.</span><span class="n">height</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>
                    <span class="n">img</span> <span class="o">=</span> <span class="n">ImageOps</span><span class="o">.</span><span class="n">contain</span><span class="p">(</span><span class="n">img</span><span class="p">,</span> <span class="p">(</span><span class="n">MAX_SIZE</span><span class="p">,</span> <span class="n">MAX_SIZE</span><span class="p">))</span>  <span class="c1"># Maintains aspect ratio                    </span>
                    <span class="n">img_bytes_io</span> <span class="o">=</span> <span class="n">BytesIO</span><span class="p">()</span>
                    <span class="n">img</span><span class="o">.</span><span class="n">save</span><span class="p">(</span><span class="n">img_bytes_io</span><span class="p">,</span> <span class="nb">format</span><span class="o">=</span><span class="n">file_ext</span><span class="p">)</span>
                    <span class="n">img_bytes</span> <span class="o">=</span> <span class="n">img_bytes_io</span><span class="o">.</span><span class="n">getvalue</span><span class="p">()</span>    
                             
                <span class="n">filename</span> <span class="o">=</span> <span class="sa">f</span><span class="s2">"</span><span class="si">{</span><span class="n">query</span><span class="o">.</span><span class="n">replace</span><span class="p">(</span><span class="s1">' '</span><span class="p">,</span><span class="w"> </span><span class="s1">'_'</span><span class="p">)</span><span class="si">}</span><span class="s2">_</span><span class="si">{</span><span class="n">count</span><span class="si">:</span><span class="s2">03d</span><span class="si">}</span><span class="s2">.</span><span class="si">{</span><span class="n">file_ext</span><span class="si">}</span><span class="s2">"</span>
                <span class="n">filepath</span> <span class="o">=</span> <span class="n">Path</span><span class="p">(</span><span class="n">folder_path</span><span class="p">)</span> <span class="o">/</span> <span class="n">filename</span>

                <span class="k">with</span> <span class="nb">open</span><span class="p">(</span><span class="n">filepath</span><span class="p">,</span> <span class="s2">"wb"</span><span class="p">)</span> <span class="k">as</span> <span class="n">f</span><span class="p">:</span>
                    <span class="n">f</span><span class="o">.</span><span class="n">write</span><span class="p">(</span><span class="n">img_bytes</span><span class="p">)</span>

                <span class="n">count</span> <span class="o">+=</span> <span class="mi">1</span>
                <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"Saved: </span><span class="si">{</span><span class="n">filepath</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>

                <span class="n">time</span><span class="o">.</span><span class="n">sleep</span><span class="p">(</span><span class="n">DELAY</span><span class="p">)</span>  <span class="c1"># preventive measure for possible rate limiting on ddg</span>

            <span class="k">except</span> <span class="ne">Exception</span> <span class="k">as</span> <span class="n">e</span><span class="p">:</span>
                <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"Error downloading </span><span class="si">{</span><span class="n">url</span><span class="si">}</span><span class="s2">: </span><span class="si">{</span><span class="n">e</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>

    <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"Finished downloading </span><span class="si">{</span><span class="n">count</span><span class="si">}</span><span class="s2"> images for '</span><span class="si">{</span><span class="n">query</span><span class="si">}</span><span class="s2">'"</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=21958919">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>In the above code along with downloading and validating images, we also resize images greater than 400 pixels (shorter side), while maintaining aspect ratio. This is done because:</p>
<ul>
<li>Large images consume significantly more GPU, RAM, and disk space.</li>
<li>They slow down data loading and training.</li>
<li>For image classification tasks, a 400px resolution is typically sufficient and strikes a good balance between accuracy and efficiency.</li>
</ul>
<p><strong>Note</strong> : In production datasets, we should also apply data augmentation techniques such as random cropping, flipping, rotation, brightness adjustments etc to some images randomly. This helps the model generalize better and become robust to variations in real-world inputs.</p>
<p>However, for this small-scale project, we’re intentionally skipping augmentations to keep the workflow focused and easy to understand.</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs" id="cell-id=7b8efbc6">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [ ]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="c1"># Download images for each racquet category</span>
<span class="n">MAX_IMAGES</span> <span class="o">=</span> <span class="mi">300</span>

<span class="k">for</span> <span class="n">sport</span> <span class="ow">in</span> <span class="n">sports</span><span class="p">:</span>
    <span class="n">folder</span> <span class="o">=</span> <span class="n">Path</span><span class="p">(</span><span class="s2">"images"</span><span class="p">)</span> <span class="o">/</span> <span class="n">sport</span><span class="o">.</span><span class="n">split</span><span class="p">()[</span><span class="mi">0</span><span class="p">]</span><span class="o">.</span><span class="n">lower</span><span class="p">()</span>
    <span class="n">download_images_bing</span><span class="p">(</span><span class="n">sport</span><span class="p">,</span> <span class="n">folder</span><span class="p">,</span> <span class="n">MAX_IMAGES</span><span class="p">)</span>

<span class="c1"># Verify image downloads</span>
<span class="k">for</span> <span class="n">sport</span> <span class="ow">in</span> <span class="n">sports</span><span class="p">:</span>
    <span class="n">folder</span> <span class="o">=</span> <span class="n">Path</span><span class="p">(</span><span class="s2">"images"</span><span class="p">)</span> <span class="o">/</span> <span class="n">sport</span><span class="o">.</span><span class="n">split</span><span class="p">()[</span><span class="mi">0</span><span class="p">]</span><span class="o">.</span><span class="n">lower</span><span class="p">()</span>
    
    <span class="c1"># Count all image files in the folder</span>
    <span class="n">file_count</span> <span class="o">=</span> <span class="nb">len</span><span class="p">(</span><span class="nb">list</span><span class="p">(</span><span class="n">folder</span><span class="o">.</span><span class="n">glob</span><span class="p">(</span><span class="s2">"*.*"</span><span class="p">)))</span>

    <span class="k">if</span> <span class="n">file_count</span> <span class="o">==</span> <span class="mi">0</span><span class="p">:</span>
        <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"No images found in </span><span class="si">{</span><span class="n">folder</span><span class="si">}</span><span class="s2">."</span><span class="p">)</span>
    <span class="k">else</span><span class="p">:</span>
        <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"</span><span class="si">{</span><span class="n">file_count</span><span class="si">}</span><span class="s2"> images found in </span><span class="si">{</span><span class="n">folder</span><span class="si">}</span><span class="s2">."</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=c09ffcf8">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>Each category was supposed to download 300 images, but the actual counts are:</p>
<ul>
<li><strong>Tennis</strong>: 260 images</li>
<li><strong>Badminton</strong>: 191 images</li>
<li><strong>Squash</strong>: 176 images</li>
<li><strong>Pickleball</strong>: 272 images</li>
</ul>
<p>Some images were skipped due to:</p>
<ul>
<li>Unsupported formats like <code>.webp</code></li>
<li>Dimensions smaller than 200×200 pixels</li>
<li>Access issues (e.g., 403 Forbidden)</li>
<li>Corrupted or invalid files</li>
</ul>
<p>Our data is downloaded and validated!</p>
<p><strong>Note</strong>: In production systems, image scraping, downloading, validation and preprocessing are never done within a training notebook or script. These tasks are treated as part of the data ingestion pipeline and are typically handled as separate jobs or services.</p>
<h3 id="Let's-proceed-to-train-our-model.">Let's proceed to train our model.<a class="anchor-link" href="#Let's-proceed-to-train-our-model.">¶</a></h3><hr/>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=b7369643">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p><strong>We'll first define a <code>DataBlock</code>.</strong></p>
<p>A <code>DataBlock</code> is a high level API in <code>fastai</code> for building datasets and <code>DataLoaders</code>. It allows us to define how to get our input items, how to label them, how to split the data and what transforms to apply.</p>
<p>You can refer to the official documentation here:  <a href="https://docs.fast.ai/data.block.html#DataBlock">https://docs.fast.ai/data.block.html#DataBlock</a></p>
<p>Below is the configuration we'll use for this project. Each line will be explained after the code block:</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs" id="cell-id=344d6e02">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [8]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="n">db</span> <span class="o">=</span> <span class="n">DataBlock</span><span class="p">(</span>
    <span class="n">blocks</span><span class="o">=</span><span class="p">(</span><span class="n">ImageBlock</span><span class="p">,</span> <span class="n">CategoryBlock</span><span class="p">),</span> 
    <span class="n">get_items</span><span class="o">=</span><span class="n">get_image_files</span><span class="p">,</span> 
    <span class="n">splitter</span><span class="o">=</span><span class="n">RandomSplitter</span><span class="p">(</span><span class="n">valid_pct</span><span class="o">=</span><span class="mf">0.2</span><span class="p">,</span> <span class="n">seed</span><span class="o">=</span><span class="mi">42</span><span class="p">),</span>
    <span class="n">get_y</span><span class="o">=</span><span class="n">parent_label</span><span class="p">,</span>
    <span class="n">item_tfms</span><span class="o">=</span><span class="p">[</span><span class="n">Resize</span><span class="p">(</span><span class="mi">192</span><span class="p">,</span> <span class="n">method</span><span class="o">=</span><span class="s1">'pad'</span><span class="p">)]</span>
<span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=4a4ed774">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>Explainaition of parameters in the code above:</p>
<ul>
<li><code>blocks</code>: The inputs to our model are <strong>images</strong>, and the outputs are <strong>categories</strong> (in our case, "badminton","squash" etc).</li>
<li><code>get_items</code>: A function to retrieve raw items — in our case: image file paths.</li>
<li><code>splitter</code>: A function that returns training and validation indices. Here we use a random 80/20 split with a fixed seed for reproducibility.</li>
<li><code>get_y</code>: A function to extract the label from each item — we’re using the parent folder name as the label.</li>
<li><code>item_tfms</code>: Transformations applied to each item — here, resizing images to 192×192 by padding it. Padding maintains the aspect ratio.</li>
</ul>
<p>OK, so now we have defined the blueprint:</p>
<ul>
<li>What type of inputs/targets to expect</li>
<li>How to get them</li>
<li>How to split the dataset</li>
<li>What transforms to apply</li>
</ul>
<p>But no actual data is loaded or processed at this point.</p>
<p><strong>Create the <code>dataloader</code></strong></p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs" id="cell-id=f9c91513">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [9]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="n">dls</span> <span class="o">=</span> <span class="n">db</span><span class="o">.</span><span class="n">dataloaders</span><span class="p">(</span><span class="n">base_dir</span><span class="p">,</span> <span class="n">bs</span><span class="o">=</span><span class="mi">64</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=2e89328d">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>What happened in the above cell?</p>
<p>The blueprint that we created in the previous step is applied to the actual data present under <code>base_dir</code> (in our case it is the <code>images/</code> folder).</p>
<p>The <code>dataloaders()</code> method scans the /images directory, retrieves all image files that match the blueprint, splits them into training and validation sets, applies any item transforms (like resizing), and finally batches the data.</p>
<p><strong>Batch Size (<code>bs=64</code>)</strong>: This specifies that the DataLoaders object should create batches of 64 images. Each batch is a single, collective unit that’s fed into the model during training. Using a moderate batch size like 64 helps balance memory usage and training speed.</p>
<p>The returned <code>dls</code> object is an instance of the <code>DataLoaders</code> class. It encapsulates:</p>
<ul>
<li><strong><code>dls.train</code></strong>: A DataLoader for the training set.</li>
<li><strong><code>dls.valid</code></strong>: A DataLoader for the validation set.</li>
</ul>
<p>These sub-DataLoaders are built on top of PyTorch's DataLoader but with additional fastai functionalities. Read the official doc here: <a href="https://docs.fast.ai/data.load.html">https://docs.fast.ai/data.load.html</a></p>
<p>This step has finalized our data ingestion pipeline. The created DataLoaders object (<code>dls</code>) serves as the interface between our dataset and our model during training.</p>
<h3 id="Training-Our-Model">Training Our Model<a class="anchor-link" href="#Training-Our-Model">¶</a></h3><p>We will begin by fine-tuning an existing, well-established computer vision model. <strong>Fine-tuning</strong> is the process of adapting a model that has already been trained on a large, general-purpose dataset to a new, more specific task. This saves time and cost for us.</p>
<p>For this project, we will be using <code>ResNet18</code>, a lightweight yet powerful convolutional neural network pretrained on the ImageNet dataset. It offers a great balance between speed and accuracy, making it ideal for rapid experimentation and limited compute environments. By fine-tuning ResNet18, we can adapt its learned representations to accurately classify images across our four racquet categories.</p>
<p>Here we go.</p>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=3e2024e6">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>To train our model, we will use the <code>vision_learner</code> API from the <a href="https://docs.fast.ai/vision.learner.html">fastai vision module</a>, which is specifically designed to streamline <a href="https://aws.amazon.com/what-is/transfer-learning/">transfer learning</a> for computer vision tasks. This API encapsulates everything needed to set up a <code>Learner</code> - a core abstraction in fastai that binds together a model,  dataloader (which we created above) and a loss function. You can read more about the <code>Learner</code> class <a href="https://docs.fast.ai/learner.html#learner">here</a>.</p>
<p><code>vision_learner</code> simplifies the process of leveraging pretrained models (such as ResNet18) for classification. It automatically handles the necessary setup for transfer learning, including proper initialization of the model's final layers to suit our dataset.</p>
<p>Once the learner is configured, we invoke <code>fine_tune(3)</code>, which trains the model for 3 epochs. This method first freezes the pretrained base to train only the new classification head, and then gradually unfreezes and fine-tunes the entire model. Official doc of fine_tune ia available <a href="https://docs.fast.ai/callback.schedule.html#learner.fine_tune">here</a>.</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell" id="cell-id=fa988071">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [12]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="n">learn</span> <span class="o">=</span> <span class="n">vision_learner</span><span class="p">(</span><span class="n">dls</span><span class="p">,</span> <span class="n">resnet18</span><span class="p">,</span> <span class="n">metrics</span><span class="o">=</span><span class="n">error_rate</span><span class="p">)</span>
<span class="n">learn</span><span class="o">.</span><span class="n">fine_tune</span><span class="p">(</span><span class="mi">3</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
<div class="jp-Cell-outputWrapper">
<div class="jp-Collapser jp-OutputCollapser jp-Cell-outputCollapser">
</div>
<div class="jp-OutputArea jp-Cell-outputArea">
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<table border="1" class="dataframe">
<thead>
<tr style="text-align: left;">
<th>epoch</th>
<th>train_loss</th>
<th>valid_loss</th>
<th>error_rate</th>
<th>time</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>1.721788</td>
<td>0.769392</td>
<td>0.284916</td>
<td>00:26</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="application/vnd.jupyter.stderr" tabindex="0">
<pre>/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<table border="1" class="dataframe">
<thead>
<tr style="text-align: left;">
<th>epoch</th>
<th>train_loss</th>
<th>valid_loss</th>
<th>error_rate</th>
<th>time</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>0.716825</td>
<td>0.562591</td>
<td>0.212290</td>
<td>00:51</td>
</tr>
<tr>
<td>1</td>
<td>0.523383</td>
<td>0.567538</td>
<td>0.206704</td>
<td>00:47</td>
</tr>
<tr>
<td>2</td>
<td>0.400680</td>
<td>0.560361</td>
<td>0.195531</td>
<td>00:57</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="application/vnd.jupyter.stderr" tabindex="0">
<pre>/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
22519.95s - thread._ident is None in _get_related_thread!
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
/home/commando/python_envs/learn_ml/lib/python3.12/site-packages/PIL/Image.py:1045: UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
  warnings.warn(
</pre>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=f26d03e8">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Training-Results">Training Results<a class="anchor-link" href="#Training-Results">¶</a></h3><p>The model was trained locally on my laptop which is a standard alptop with no dedicated GPU.</p>
<ul>
<li><strong>CPU</strong>: Intel i7 13th Gen</li>
<li><strong>Memory</strong>: 16 GB</li>
<li><strong>GPU</strong>: Integrated Intel Graphics</li>
</ul>
<p>Despite lacking a dedicated GPU, training was completed in a reasonable time of around <strong>3 minutes</strong> for 3 epochs.</p>
<p>Here are the training results:</p>
<h4 id="Initial-Phase-(frozen-base-layer)">Initial Phase (frozen base layer)<a class="anchor-link" href="#Initial-Phase-(frozen-base-layer)">¶</a></h4><table>
<thead>
<tr>
<th>epoch</th>
<th>train_loss</th>
<th>valid_loss</th>
<th>error_rate</th>
<th>time</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>1.823223</td>
<td>0.750006</td>
<td>0.240223</td>
<td>00:20</td>
</tr>
</tbody>
</table>
<h4 id="Fine-Tuning-Phase-(unfrozen-model)">Fine-Tuning Phase (unfrozen model)<a class="anchor-link" href="#Fine-Tuning-Phase-(unfrozen-model)">¶</a></h4><table>
<thead>
<tr>
<th>epoch</th>
<th>train_loss</th>
<th>valid_loss</th>
<th>error_rate</th>
<th>time</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>0.663238</td>
<td>0.580100</td>
<td>0.201117</td>
<td>00:53</td>
</tr>
<tr>
<td>1</td>
<td>0.510640</td>
<td>0.544243</td>
<td>0.173184</td>
<td>00:51</td>
</tr>
<tr>
<td>2</td>
<td>0.372500</td>
<td>0.517990</td>
<td>0.150838</td>
<td>00:52</td>
</tr>
</tbody>
</table>
<p>As seen, the <strong>error rate steadily decreased</strong> with each epoch, indicating the model is learning to distinguish racquet types better over time. The <strong>final error rate of ~15%</strong> is quite decent for a first pass, especially considering the small dataset used by us.</p>
<p>Before we start analyzing our results more deeply, it’s important to understand the two key components commonly found in modern deep learning workflows: the <strong>base model</strong> and the <strong>custom classifier</strong>.</p>
<ul>
<li><p>The <strong>base model</strong> (also called the <em>pretrained model</em>, <em>feature extractor</em> or sometimes the <em>backbone</em>) is typically a convolutional neural network (eg ResNet18) that has already been trained on a large and diverse dataset (eg ImageNet). Its job is to extract general visual features (like edges, textures, and patterns) that are useful across many tasks.</p>
</li>
<li><p>The <strong>custom classifier</strong> (also referred to as the <em>head</em> or <em>task-specific classifier</em>) is a set of new layers added on top of the base model. These layers are trained specifically for our problem - in this case, classifying images of racquets into categories.</p>
</li>
</ul>
<p>With this structure in mind, let's break down how our model was trained in two distinct phases.</p>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=7fbf1a07">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>The training was performed in two distinct phases:</p>
<h3 id="Initial-Phase-(Frozen-Base-Model)"><strong>Initial Phase (Frozen Base Model)</strong><a class="anchor-link" href="#Initial-Phase-(Frozen-Base-Model)">¶</a></h3><ul>
<li><p><strong>Pretrained Base Model (ResNet18)</strong>:<br/>
We began with ResNet18, a convolutional neural network pretrained on ImageNet. This model has already learned to identify general visual patterns—such as edges, textures, and shapes—that are widely applicable across image classification tasks.</p>
</li>
<li><p><strong>Frozen Weights</strong>:<br/>
In this stage, the base model's weights are <strong>frozen</strong>, meaning they are <strong>not updated during training</strong>. This preserves the valuable feature extraction capabilities the model has learned from the large and diverse ImageNet dataset.</p>
</li>
<li><p><strong>Custom Classifier (Task-Specific Layers)</strong>:<br/>
On top of this frozen base model, a <strong>custom classifier</strong> was added by fastai’s <code>vision_learner</code> function. This classifier is a set of fully connected layers specifically designed to map the extracted features to our target classes—different types of racquets in our case.</p>
<ul>
<li><p><strong>In this phase</strong>, only the <em>custom classifier</em> is trained. It learns how to interpret the high-level features produced by the base model and map them to the correct racquet class (tennis, badminton, squash or pickleball).</p>
</li>
<li><p><strong>Why This Matters</strong>:</p>
<ul>
<li>It allows for quick adaptation to our domain-specific data with minimal training effort.</li>
<li>It ensures that the general visual understanding built into the base model is not disturbed, giving us a solid foundation without requiring retraining from scratch.</li>
</ul>
</li>
</ul>
</li>
</ul>
<h4 id="Inspecting-the-Model">Inspecting the Model<a class="anchor-link" href="#Inspecting-the-Model">¶</a></h4><p>To view the details of the model you can use-</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs" id="cell-id=0ce7ebe7">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [ ]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="n">learn</span><span class="o">.</span><span class="n">model</span>     <span class="c1">#shows the complete architecture.</span>
<span class="n">learn</span><span class="o">.</span><span class="n">model</span><span class="p">[</span><span class="mi">0</span><span class="p">]</span>  <span class="c1">#shows the base layer (ResNet18).</span>
<span class="n">learn</span><span class="o">.</span><span class="n">model</span><span class="p">[</span><span class="mi">1</span><span class="p">]</span>  <span class="c1">#shows the head (custom classification layers).</span>
</pre></div>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=3a511695">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>Once our custom classifier (head) has learned to interpret the features extracted by the base model, we move to the next phase.</p>
<h3 id="Fine-Tuning-Phase"><strong>Fine-Tuning Phase</strong><a class="anchor-link" href="#Fine-Tuning-Phase">¶</a></h3><h4 id="Unfreezing-the-Base-Model"><strong>Unfreezing the Base Model</strong><a class="anchor-link" href="#Unfreezing-the-Base-Model">¶</a></h4><p>In this phase, we <strong>unfreeze</strong> the layers of the base model (ResNet18). This means all the convolutional layers—which were previously frozen to preserve their pretrained knowledge are now allowed to <strong>update their weights</strong> during training.</p>
<ul>
<li><p><strong>Why unfreeze?</strong><br/>
Because the base model was originally trained on a generic dataset (ImageNet), and now it’s time to <strong>adapt those generic features to our specific task</strong>: recognizing different types of racquets.</p>
<p>For instance, ImageNet may have taught the model to recognize general features like curves, grips or mesh, but our racquet dataset may need a bit more tuning to differentiate between, say, a badminton racquet and a tennis racquet.</p>
</li>
</ul>
<p>Now, both the <strong>base model</strong> and the <strong>custom classifier</strong> are trained together:</p>
<ul>
<li>The <strong>classifier continues</strong> to improve its ability to make task-specific predictions.</li>
<li>The <strong>base model begins to adjust</strong> its filters to extract slightly more specialized features tailored to racquet identification.</li>
</ul>
<h4 id="Key-Benefits"><strong>Key Benefits</strong><a class="anchor-link" href="#Key-Benefits">¶</a></h4><ul>
<li>This phase allows for <strong>deeper adaptation</strong> to our racquet dataset. This turns out to be helpful if our dataset is visually different from ImageNet.</li>
<li>It helps the model <strong>refine feature extraction</strong> for better accuracy especially for edge cases.</li>
</ul>
<p>This two-phase approach is the basis of <code>transfer learning</code> as it leverages existing knowledge of ResNet18 and quickly adapting to our specific task (classifying racquet images).</p>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=6b61c91c">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Detailed-Explanation-of-Result-Table-Headers">Detailed Explanation of Result Table Headers<a class="anchor-link" href="#Detailed-Explanation-of-Result-Table-Headers">¶</a></h3><p>Now let’s understand the meaning of each column in our training results and interpret the data.</p>
<p>Lets revisit the result of Phase 1</p>
<table>
<thead>
<tr>
<th>epoch</th>
<th>train_loss</th>
<th>valid_loss</th>
<th>error_rate</th>
<th>time</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>1.823223</td>
<td>0.750006</td>
<td>0.240223</td>
<td>00:20</td>
</tr>
</tbody>
</table>
<p>Here’s a detailed analysis of each column and what the numbers mean:</p>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=7e7124d6">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h4 id="1.-epoch">1. <strong>epoch</strong><a class="anchor-link" href="#1.-epoch">¶</a></h4><p>An <strong>epoch</strong> is one full pass over the entire training dataset. Multiple epochs allow the model to iteratively adjust its internal weights to better fit the data. So, if you train for 3 epochs, the model will see each training sample 3 times — potentially improving its predictions each time.</p>
<p>If you remember, couple of cells above, while creating the dataloader we had configured the batch size to 64.</p>
<p><code>dls = db.dataloaders(base_dir, bs=64)</code></p>
<p>Let’s say we have a total of <strong>800 images</strong> for all racquets combined. We split this dataset into 80% for training and 20% for validation. That gives us <strong>640 training images</strong>.</p>
<p>Given a batch size of 64, the 640 training images are divided into <strong>10 batches</strong>. The model is trained on each of these batches sequentially during one epoch. For each batch, it:</p>
<ul>
<li>performs a forward pass to make predictions,</li>
<li>compares predictions with actual labels to compute <strong>training loss</strong>,</li>
<li>performs backpropagation and weight updates.</li>
</ul>
<p>After all 10 batches are processed, that completes <strong>1 epoch</strong>. The <strong>training loss for the epoch</strong> is the average of the individual batch losses.</p>
<p>Once training for that epoch is complete, the model is evaluated on the <strong>validation dataset (160 images)</strong>:</p>
<ul>
<li>It makes predictions on the validation set <strong>without updating the weights</strong>.</li>
<li>From this, we get the <strong>validation loss</strong> and <strong>error rate</strong>.</li>
</ul>
<p>In short:</p>
<ul>
<li><strong>Epoch</strong> = One complete pass over the <strong>training data only</strong></li>
<li><strong>Validation</strong> = Happens <strong>after each epoch</strong>, using the held-out <strong>validation set</strong> to assess generalization performance.</li>
</ul>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=646d765d">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h4 id="2.-train_loss-(Training-Loss)">2. <strong>train_loss</strong> (Training Loss)<a class="anchor-link" href="#2.-train_loss-(Training-Loss)">¶</a></h4><p>During the training phase, the model learns by adjusting its internal parameters — the weights of the neural network — to minimize errors in its predictions. <strong>Training loss</strong> is the key metric that tells us <em>how far off</em> the model’s predictions were from the actual labels <strong>on the training data</strong>.</p>
<p>For each batch, the model does the following:</p>
<ol>
<li><strong>Forward Pass</strong> – It makes predictions for all 64 images in the batch.</li>
<li><strong>Loss Calculation</strong> – It compares these predictions with the actual labels using a loss function (<em>cross-entropy</em> in our case).</li>
<li><strong>Backpropagation</strong> – Based on this loss, it computes gradients and updates the weights to reduce the error.</li>
</ol>
<p>This gives us one training loss of this particular batch.</p>
<p>Once all 10 batches (1 epoch) are processed:</p>
<ul>
<li>The training losses from each batch are <strong>averaged</strong> to produce the <strong>epoch-level training loss</strong>.</li>
<li>This value gives us a sense of how well the model is doing <em>on the data it is actively learning from</em>.</li>
</ul>
<p>A lower training loss over time typically indicates that the model is learning.</p>
<p>In our racquet classification project, the <code>vision_learner</code> function from fastai automatically selects an appropriate loss function based on the task. Since we are solving a multi-class classification problem fastai uses <strong><a href="https://pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html">CrossEntropyLoss</a></strong>.</p>
<p>You can confirm this by:</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell" id="cell-id=a67207cf">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [14]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="n">learn</span><span class="o">.</span><span class="n">loss_func</span>
</pre></div>
</div>
</div>
</div>
</div>
<div class="jp-Cell-outputWrapper">
<div class="jp-Collapser jp-OutputCollapser jp-Cell-outputCollapser">
</div>
<div class="jp-OutputArea jp-Cell-outputArea">
<div class="jp-OutputArea-child jp-OutputArea-executeResult">
<div class="jp-OutputPrompt jp-OutputArea-prompt">Out[14]:</div>
<div class="jp-RenderedText jp-OutputArea-output jp-OutputArea-executeResult" data-mime-type="text/plain" tabindex="0">
<pre>FlattenedLoss of CrossEntropyLoss()</pre>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=054d4ae9">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h4 id="3.-valid_loss-(Validation-Loss)">3. <strong>valid_loss</strong> (Validation Loss)<a class="anchor-link" href="#3.-valid_loss-(Validation-Loss)">¶</a></h4><p>While the <strong>training loss</strong> tells us how well the model is performing on the training data, the <strong>validation loss</strong> is our best indicator of how well the model is likely to perform on unseen data (like production environment).</p>
<p>Once the model completes one epoch, it’s time to evaluate how well it generalizes. This is where the <strong>validation set</strong> comes in — the 20% portion of the data we had held back and not used during training.</p>
<p>Here’s what happens step-by-step:</p>
<ul>
<li>The model makes predictions on the <strong>entire validation set</strong>.</li>
<li>It <strong>compares those predictions with the actual labels</strong> (just like it does with the training data).</li>
<li>Then it calculates the <strong>average loss</strong> over all validation samples using the same loss function (in our case, CrossEntropyLoss).</li>
<li>This average is the <strong>validation loss</strong>.</li>
</ul>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=148382e0">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h4 id="4.-error_rate">4. <strong>error_rate</strong><a class="anchor-link" href="#4.-error_rate">¶</a></h4><p><strong>Error Rate</strong> tells us what percentage of predictions made by the model were incorrect. This gives us a more <strong>human-readable performance measure</strong>.</p>
<p>Here is how it is calculated-</p>
<p>After an epoch completes:</p>
<ul>
<li>The model is run on the <strong>validation dataset</strong>.</li>
<li>For each image, the model outputs <strong>predicted probabilities</strong> for all classes (racquet types).</li>
<li>The class with the <strong>highest probability</strong> is selected as the model's prediction.</li>
<li>This predicted label is compared against the <strong>actual label</strong>.</li>
</ul>
<p>If they match : Correct.<br/>
If they don't : Incorrect.</p>
<p>The <strong>Error Rate</strong> is then calculated as:</p>
<blockquote>
<p>Error Rate = (Number of Incorrect Predictions)/(Total Number of Validation Samples)</p>
</blockquote>
<p>You will often see some models reporting <strong>accuracy</strong> — which is simply:</p>
<blockquote>
<p>Accuracy = 1 - Error Rate</p>
</blockquote>
<p>So suppose in our example, Error Rate is <strong>0.24</strong> (~24%), Accuracy will be 1-0.24 = <strong>0.76</strong> (76%)</p>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=2cb0c93e">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h4 id="5.-time">5. <strong>time</strong><a class="anchor-link" href="#5.-time">¶</a></h4><p>The elapsed time to complete one epoch.
This metric helps gauge how quickly the model is training. It can be influenced by factors like dataset size, model complexity and hardware (e.g., CPU vs. GPU).</p>
<h4 id="Summary">Summary<a class="anchor-link" href="#Summary">¶</a></h4><table>
<thead>
<tr>
<th><strong>Header</strong></th>
<th><strong>Data Used</strong></th>
<th><strong>Purpose</strong></th>
<th><strong>Is Lower Better?</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>epoch</strong></td>
<td>—</td>
<td>Indicates how many full passes the model has made over the training dataset.</td>
<td>—</td>
</tr>
<tr>
<td><strong>train_loss</strong></td>
<td>Training set</td>
<td>Measures how well the model fits the training data; used to guide weight updates during training.</td>
<td>Yes</td>
</tr>
<tr>
<td><strong>valid_loss</strong></td>
<td>Validation set</td>
<td>Evaluates how well the model generalizes to unseen data; key for detecting overfitting.</td>
<td>Yes</td>
</tr>
<tr>
<td><strong>error_rate</strong></td>
<td>Validation set</td>
<td>Proportion of incorrect predictions on validation data (1 - accuracy).</td>
<td>Yes</td>
</tr>
<tr>
<td><strong>time</strong></td>
<td>Whole epoch</td>
<td>Duration taken to complete one full epoch (training + validation).</td>
<td>—</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=9063fd96">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Training-Loss-vs.-Error-Rate"><strong>Training Loss vs. Error Rate</strong><a class="anchor-link" href="#Training-Loss-vs.-Error-Rate">¶</a></h3><p>A common confusion that some people may have (I certainly had in the beginning) is: <strong>what’s the difference between validation loss and error rate?</strong><br/>
Though both are evaluated on the validation set, they measure very different things. Let’s break down the differences in the table below:</p>
<table>
<thead>
<tr>
<th>Aspect</th>
<th><strong>Validation Loss</strong></th>
<th><strong>Error Rate</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Definition</strong></td>
<td>A numerical value from the loss function (e.g., cross-entropy)</td>
<td>The fraction of incorrect predictions</td>
</tr>
<tr>
<td><strong>What it Measures</strong></td>
<td>How well the model's <strong>probability distribution</strong> matches the true labels</td>
<td>Whether the model's <strong>top predicted class</strong> is correct or not</td>
</tr>
<tr>
<td><strong>Type</strong></td>
<td><strong>Continuous</strong> — can range across real values (e.g., 0.543)</td>
<td><strong>Discrete</strong> — typically between 0 and 1 (e.g., 0.17 means 17% wrong)</td>
</tr>
<tr>
<td><strong>Sensitivity</strong></td>
<td>Sensitive to <strong>confidence</strong> in correct predictions</td>
<td>Only considers <strong>right vs wrong</strong>, regardless of confidence</td>
</tr>
<tr>
<td><strong>Output Basis</strong></td>
<td>Calculated from all predicted <strong>probabilities</strong></td>
<td>Calculated from final <strong>class labels</strong> after argmax</td>
</tr>
<tr>
<td><strong>Interpretability</strong></td>
<td>More nuanced but harder to interpret directly</td>
<td>Very interpretable — “X% predictions were wrong”</td>
</tr>
<tr>
<td><strong>Goal</strong></td>
<td>Minimize it to improve model <strong>confidence and accuracy</strong></td>
<td>Minimize it to reduce outright <strong>classification errors</strong></td>
</tr>
<tr>
<td><strong>Use Case</strong></td>
<td>Guides <strong>training and optimization</strong> of the model</td>
<td>Helps judge <strong>real-world prediction performance</strong></td>
</tr>
</tbody>
</table>
<h4 id="Example:">Example:<a class="anchor-link" href="#Example:">¶</a></h4><p>Suppose for an image of a <strong>tennis racquet</strong>, our model predicts the following probabilities:</p>
<ul>
<li><strong>Tennis:</strong> 0.55</li>
<li><strong>Badminton:</strong> 0.40</li>
<li><strong>Squash:</strong> 0.03</li>
<li><strong>Pickleball:</strong> 0.02</li>
</ul>
<p>Here is how to interpret it:</p>
<ul>
<li><strong>Prediction is correct</strong>, because <strong>tennis</strong> has the highest probability and matches the true label.</li>
<li>However, the <strong>confidence</strong> (55%) is not very high—this means the model wasn’t very <em>sure</em>.</li>
<li><strong>Validation loss</strong> (e.g., cross-entropy loss) will still be <strong>moderately high</strong>, because it penalizes low confidence even when the prediction is correct.</li>
<li><strong>Error rate = 0</strong>, because the top predicted class is correct.</li>
</ul>
<p>To Summarize:</p>
<ul>
<li>Use <strong>validation loss</strong> for model optimization and fine-tuning.</li>
<li>Use <strong>error rate</strong> for a high-level, human-readable performance metric.</li>
</ul>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=dd108913">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Interpreting-Train-Loss,-Valid-Loss-and-Error-Rate">Interpreting Train Loss, Valid Loss and Error Rate<a class="anchor-link" href="#Interpreting-Train-Loss,-Valid-Loss-and-Error-Rate">¶</a></h3><p><a href="https://x.com/jeremyphoward">Jeremy Howard</a>, co-founder of fastai and a respected authority in AI, emphasizes that overfitting in deep learning is widely misunderstood. Contrary to popular belief, a lower <strong>training loss</strong> compared to <strong>validation loss</strong> is not a sign of failure. It is expected and reflects a properly trained model. He says that overfitting is rare in modern deep learning and requires deliberate effort to induce, such as disabling safeguards like data augmentation, dropout or weight decay.</p>
<p>The true indicator of overfitting isn’t the loss gap but a <strong>rising validation error rate</strong> - the point where the model’s prediction accuracy on unseen data deteriorates despite improving training performance. He clarifies that we should focus on <strong>error rates</strong> (e.g., misclassifications) rather than obsessing over loss values. As long as error rate improves, longer training is beneficial, even if validation loss increases.</p>
<p>Summary:</p>
<ul>
<li><strong>Error rate</strong> (not loss) determines overfitting.</li>
<li>Modern models generalize well unless stripped of regularization tools.</li>
<li>Continue training until error rate plateaus or start increasing.</li>
</ul>
<p><a href="https://x.com/jeremyphoward/status/1073361458048561154">Original source</a></p>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=8a9131f4">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Testing-the-Trained-Model-on-Unseen-Images">Testing the Trained Model on Unseen Images<a class="anchor-link" href="#Testing-the-Trained-Model-on-Unseen-Images">¶</a></h3><p>Our model is now fully trained, and it's time to evaluate its performance on unseen images of racquets.</p>
<p>To do this, I downloaded a handful of racquet images from the internet and placed them in a separate folder named <strong><code>test_images</code></strong>, which resides at the same level as this Jupyter notebook file.</p>
<p>To make evaluation easier, I manually renamed each file by prefixing the filename with the <strong>first letter of the correct category</strong>:</p>
<p>eg:</p>
<ul>
<li><code>t_1.jpg</code> → Tennis racquet</li>
<li><code>b_3.png</code> → Badminton racquet</li>
<li><code>s_4.jpeg</code> → Squash racquet</li>
<li><code>p_2.jpg</code> → Pickleball racquet</li>
</ul>
<p>This convention allows us to <strong>automatically extract the correct label</strong> for each image and compare it with the model’s prediction.</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell" id="cell-id=205884f3">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [ ]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="c1">#set the test images path</span>
<span class="n">test_images_folder</span> <span class="o">=</span> <span class="n">Path</span><span class="p">(</span><span class="s2">"test_images"</span><span class="p">)</span>

<span class="n">prefix_to_label</span> <span class="o">=</span> <span class="p">{</span>
    <span class="s1">'b'</span><span class="p">:</span> <span class="s1">'badminton'</span><span class="p">,</span>
    <span class="s1">'t'</span><span class="p">:</span> <span class="s1">'tennis'</span><span class="p">,</span>
    <span class="s1">'s'</span><span class="p">:</span> <span class="s1">'squash'</span><span class="p">,</span>
    <span class="s1">'p'</span><span class="p">:</span> <span class="s1">'pickleball'</span>
<span class="p">}</span>
</pre></div>
</div>
</div>
</div>
</div>
<div class="jp-Cell-outputWrapper">
<div class="jp-Collapser jp-OutputCollapser jp-Cell-outputCollapser">
</div>
<div class="jp-OutputArea jp-Cell-outputArea">
<div class="jp-OutputArea-child jp-OutputArea-executeResult">
<div class="jp-OutputPrompt jp-OutputArea-prompt">Out[ ]:</div>
<div class="jp-RenderedText jp-OutputArea-output jp-OutputArea-executeResult" data-mime-type="text/plain" tabindex="0">
<pre>'badminton'</pre>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=b997a44f">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>With the setup in place, we are now ready to test our model against the unseen racquet images.</p>
<p>We iterate over each image in the <code>test_images</code> folder and use our trained model to make predictions. At the same time, we infer the correct label from the filename prefix (b, t, s, or p) using a simple dictionary mapping.</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell" id="cell-id=ec5934c5">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [60]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="n">total</span> <span class="o">=</span> <span class="mi">0</span>
<span class="n">correct</span> <span class="o">=</span> <span class="mi">0</span>

<span class="k">for</span> <span class="n">img_file</span> <span class="ow">in</span> <span class="n">test_images_folder</span><span class="o">.</span><span class="n">ls</span><span class="p">():</span>
    <span class="k">if</span> <span class="n">img_file</span><span class="o">.</span><span class="n">suffix</span><span class="o">.</span><span class="n">lower</span><span class="p">()</span> <span class="ow">in</span> <span class="p">[</span><span class="s1">'.jpg'</span><span class="p">,</span> <span class="s1">'.png'</span><span class="p">,</span> <span class="s1">'.jpeg'</span><span class="p">]:</span>
        <span class="n">first_letter</span> <span class="o">=</span> <span class="n">img_file</span><span class="o">.</span><span class="n">name</span><span class="p">[</span><span class="mi">0</span><span class="p">]</span><span class="o">.</span><span class="n">lower</span><span class="p">()</span> <span class="c1">#p/b/t/s</span>
        
        <span class="k">if</span> <span class="n">first_letter</span> <span class="ow">not</span> <span class="ow">in</span> <span class="n">prefix_to_label</span><span class="p">:</span>
            <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">" -- Skipping :: Unknown prefix '</span><span class="si">{</span><span class="n">first_letter</span><span class="si">}</span><span class="s2">' in filename '</span><span class="si">{</span><span class="n">img_file</span><span class="o">.</span><span class="n">name</span><span class="si">}</span><span class="s2">'."</span><span class="p">)</span>
            <span class="k">continue</span>

        <span class="n">correct_label</span> <span class="o">=</span> <span class="n">prefix_to_label</span><span class="o">.</span><span class="n">get</span><span class="p">(</span><span class="n">first_letter</span><span class="p">)</span>
        
        <span class="n">pred_label</span><span class="p">,</span> <span class="n">pred_idx</span><span class="p">,</span> <span class="n">probs</span> <span class="o">=</span> <span class="n">learn</span><span class="o">.</span><span class="n">predict</span><span class="p">(</span><span class="n">img_file</span><span class="p">)</span>

        <span class="c1">#get the probabilities for each category</span>
       
        <span class="n">prob_str</span> <span class="o">=</span> <span class="s2">""</span>
        <span class="k">for</span> <span class="n">i</span> <span class="ow">in</span> <span class="nb">range</span><span class="p">(</span><span class="nb">len</span><span class="p">(</span><span class="n">probs</span><span class="p">)):</span>
            <span class="n">prob_percentage</span> <span class="o">=</span> <span class="nb">round</span><span class="p">(</span><span class="n">probs</span><span class="p">[</span><span class="n">i</span><span class="p">]</span><span class="o">.</span><span class="n">item</span><span class="p">()</span><span class="o">*</span><span class="mi">100</span><span class="p">,</span> <span class="mi">2</span><span class="p">)</span>
            <span class="n">prob_category</span> <span class="o">=</span> <span class="n">learn</span><span class="o">.</span><span class="n">dls</span><span class="o">.</span><span class="n">vocab</span><span class="p">[</span><span class="n">i</span><span class="p">]</span>
            <span class="n">prob_str</span> <span class="o">=</span> <span class="sa">f</span><span class="s2">"</span><span class="si">{</span><span class="n">prob_str</span><span class="si">}</span><span class="s2"> , </span><span class="si">{</span><span class="n">prob_category</span><span class="p">[</span><span class="mi">0</span><span class="p">]</span><span class="si">}</span><span class="s2">: </span><span class="si">{</span><span class="n">prob_percentage</span><span class="si">}</span><span class="s2">"</span>
                
        <span class="n">prob_str</span> <span class="o">=</span> <span class="n">prob_str</span><span class="p">[</span><span class="mi">3</span><span class="p">:]</span>       
        
        
        <span class="n">result</span> <span class="o">=</span> <span class="s2">"xxx Incorrect xxx"</span>
        <span class="k">if</span> <span class="n">pred_label</span> <span class="o">==</span> <span class="n">correct_label</span><span class="p">:</span>
            <span class="n">result</span> <span class="o">=</span> <span class="s2">"Correct"</span>   
            <span class="n">correct</span> <span class="o">+=</span> <span class="mi">1</span>

        <span class="n">total</span> <span class="o">+=</span> <span class="mi">1</span>         
        
        <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">" * </span><span class="si">{</span><span class="n">img_file</span><span class="o">.</span><span class="n">name</span><span class="si">}</span><span class="s2"> | Actual: </span><span class="si">{</span><span class="n">correct_label</span><span class="si">}</span><span class="s2"> | Predicted: </span><span class="si">{</span><span class="n">pred_label</span><span class="si">}</span><span class="s2"> | Probabilities: [</span><span class="si">{</span><span class="n">prob_str</span><span class="si">}</span><span class="s2">] | </span><span class="si">{</span><span class="n">result</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>

    <span class="k">else</span><span class="p">:</span>
        <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"</span><span class="se">\n</span><span class="s2"> -- Skipping ::  Unsupported file ext: </span><span class="si">{</span><span class="n">img_file</span><span class="o">.</span><span class="n">name</span><span class="si">}</span><span class="s2">"</span><span class="p">)</span>

<span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"</span><span class="se">\n\n</span><span class="s2">Total images: </span><span class="si">{</span><span class="n">total</span><span class="si">}</span><span class="s2">. Correct: </span><span class="si">{</span><span class="n">correct</span><span class="si">}</span><span class="s2">."</span><span class="p">)</span>
<span class="n">accuracy</span> <span class="o">=</span> <span class="n">correct</span> <span class="o">/</span> <span class="n">total</span> <span class="o">*</span> <span class="mi">100</span>
<span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">"Accuracy: </span><span class="si">{</span><span class="n">accuracy</span><span class="si">:</span><span class="s2">.2f</span><span class="si">}</span><span class="s2">%"</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
<div class="jp-Cell-outputWrapper">
<div class="jp-Collapser jp-OutputCollapser jp-Cell-outputCollapser">
</div>
<div class="jp-OutputArea jp-Cell-outputArea">
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> -- Skipping :: Unknown prefix 'r' in filename 'r_3.png'.
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<div>
<progress class="" max="1" style="width:300px; height:20px; vertical-align: middle;" value="0"></progress>
      0.00% [0/1 00:00&lt;?]
    </div>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * p_2.jpeg | Actual: pickleball | Predicted: pickleball | Probabilities: [b: 0.0 , p: 99.91 , s: 0.01 , t: 0.08] | Correct

 -- Skipping ::  Unsupported file ext: p_football.webp
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * b_broken_1.jpg | Actual: badminton | Predicted: badminton | Probabilities: [b: 80.58 , p: 0.04 , s: 1.09 , t: 18.3] | Correct
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * t_2.jpeg | Actual: tennis | Predicted: tennis | Probabilities: [b: 0.36 , p: 7.9 , s: 0.12 , t: 91.63] | Correct
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * p_1.png | Actual: pickleball | Predicted: pickleball | Probabilities: [b: 0.0 , p: 100.0 , s: 0.0 , t: 0.0] | Correct
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * t_1.png | Actual: tennis | Predicted: squash | Probabilities: [b: 2.24 , p: 0.0 , s: 58.06 , t: 39.7] | xxx Incorrect xxx
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * s_2.png | Actual: squash | Predicted: squash | Probabilities: [b: 33.58 , p: 0.0 , s: 63.36 , t: 3.06] | Correct
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * b_1.png | Actual: badminton | Predicted: badminton | Probabilities: [b: 99.75 , p: 0.01 , s: 0.03 , t: 0.2] | Correct
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * p_22.png | Actual: pickleball | Predicted: pickleball | Probabilities: [b: 0.0 , p: 99.81 , s: 0.01 , t: 0.18] | Correct
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * b_broken_ch_2.png | Actual: badminton | Predicted: badminton | Probabilities: [b: 88.69 , p: 0.2 , s: 7.98 , t: 3.14] | Correct
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * t_3.jpeg | Actual: tennis | Predicted: badminton | Probabilities: [b: 73.21 , p: 0.03 , s: 0.89 , t: 25.87] | xxx Incorrect xxx
</pre>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain" tabindex="0">
<pre> * s_1.png | Actual: squash | Predicted: squash | Probabilities: [b: 0.01 , p: 0.0 , s: 99.96 , t: 0.03] | Correct


Total images: 11. Correct: 9.
Accuracy: 81.82%
</pre>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=f62aafc4">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Result-Evaluation">Result Evaluation<a class="anchor-link" href="#Result-Evaluation">¶</a></h3><p>In the above code I tested the performance of our model on a set of 13 images.</p>
<p>We skipped 2 files having:</p>
<ul>
<li>Unknown prefix (<code>r_3.png</code>)</li>
<li>Unsupported file format (<code>p_football.webp</code>)</li>
</ul>
<p>The model made predictions on 11 valid images. For each one, we displayed:</p>
<ul>
<li>Actual category (inferred from filename)</li>
<li>Predicted category</li>
<li>Prediction confidence scores for each category</li>
<li>Whether the prediction was <strong>correct</strong> or <strong>incorrect</strong></li>
</ul>
<p>Here’s a snapshot of how our model performed:</p>
<ul>
<li><strong>Correct predictions</strong>: 9</li>
<li><strong>Incorrect predictions</strong>: 2</li>
<li><strong>Accuracy</strong>: 81.82%</li>
</ul>
<p>The 2 incorrect predictions were:</p>
<ul>
<li><code>t_1.png</code> (actual: <strong>tennis</strong>) → predicted as <strong>squash</strong>.</li>
<li><code>t_3.jpeg</code> (actual: <strong>tennis</strong>) → predicted as <strong>badminton</strong>.</li>
</ul>
<h3 id="Conclusion">Conclusion<a class="anchor-link" href="#Conclusion">¶</a></h3><p>Despite a <strong>small test set</strong> (170-270 images per category), our model showed promising generalization. It classified images with pretty decent accuracy and minimal tuning. With an accuracy of <strong>81.82%</strong>, the model is doing well but there's a scope for improvement. Here’s how to push it further:</p>
<h4 id="--Add-More-and-Better-Training-Data">- Add More and Better Training Data<a class="anchor-link" href="#--Add-More-and-Better-Training-Data">¶</a></h4><ul>
<li>Increase dataset size</li>
<li><strong>Add variety</strong>: different angles, lighting, backgrounds etc. This helps the model generalize better to real-world cases.</li>
</ul>
<h4 id="--Use-Data-Augmentation">- Use Data Augmentation<a class="anchor-link" href="#--Use-Data-Augmentation">¶</a></h4><ul>
<li>Apply transforms like <strong>rotation, zoom, lighting changes</strong> and <strong>flipping</strong>.</li>
<li>Simulates real-world distortions and improves robustness.</li>
<li>Fastai provides several APIs to makes this easy.</li>
</ul>
<h4 id="--Fine-Tune-the-Whole-Model">- Fine-Tune the Whole Model<a class="anchor-link" href="#--Fine-Tune-the-Whole-Model">¶</a></h4><p>The model can be further improved using advanced techniques like <strong>unfreezing the backbone</strong>, <strong>discriminative learning rates</strong> and <strong>progressive resizing</strong>. These approaches allow deeper layers to adapt to task-specific patterns more effectively. However, these are broader topics and go beyond the scope of this project. We may explore them more deeply in future projects.</p>
<p>This wraps up the training and evaluation phase. Our model is now ready to be integrated into real-world applications or further optimized for production use.</p>
<p>Last but not the least, let's see how we can save our trained model.</p>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=aa347db5">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Saving-the-Model">Saving the Model<a class="anchor-link" href="#Saving-the-Model">¶</a></h3><p>Saving the model allows us to:</p>
<ul>
<li>Preserve all the learned weights and architecture.</li>
<li>Avoid retraining from scratch every time.</li>
<li>Quickly reload the model for inference or further fine-tuning.</li>
</ul>
<p>In fastai, it’s straightforward:</p>
<p><code>learn.export('racquet_classifier.pkl')</code></p>
<p>This creates a file named <em>racquet_classifier.pkl</em>, which contains everything needed to make predictions later — including the model architecture, trained weights and class mappings.</p>
<p>By default, the model will be saved in the same directory as your notebook. You can also specify a different path if needed:</p>
<p><code>learn.export('/path/to/folder/racquet_classifier.pkl')</code></p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs" id="cell-id=06c9cdd4">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [65]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="c1"># Save the trained model</span>
<span class="n">learn</span><span class="o">.</span><span class="n">export</span><span class="p">(</span><span class="s1">'racquet_classifier.pkl'</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=32c5b348">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>To load the model later:</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs" id="cell-id=4b4aa8ee">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [68]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="n">learn_reborn</span> <span class="o">=</span> <span class="n">load_learner</span><span class="p">(</span><span class="s1">'racquet_classifier.pkl'</span><span class="p">)</span>
</pre></div>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=d9a159f8">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<p>Now <em>learn_reborn</em> is ready to classify racquets — no retraining required!</p>
</div>
</div>
</div>
</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell" id="cell-id=7094117c">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-InputPrompt jp-InputArea-prompt">In [ ]:</div>
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
<div class="cm-editor cm-s-jupyter">
<div class="highlight hl-ipython3"><pre><span></span><span class="c1">#Lets try to predict the category of a badminton image using the reborn model</span>
<span class="n">pred_label</span><span class="p">,</span> <span class="n">pred_idx</span><span class="p">,</span> <span class="n">probs</span> <span class="o">=</span> <span class="n">learn_reborn</span><span class="o">.</span><span class="n">predict</span><span class="p">(</span><span class="s1">'./test_images/b_1.png'</span><span class="p">)</span>
<span class="n">pred_label</span> <span class="c1">#it successfully predicts the category as badminton</span>
</pre></div>
</div>
</div>
</div>
</div>
<div class="jp-Cell-outputWrapper">
<div class="jp-Collapser jp-OutputCollapser jp-Cell-outputCollapser">
</div>
<div class="jp-OutputArea jp-Cell-outputArea">
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
<style>
    /* Turns off some styling */
    progress {
        /* gets rid of default border in Firefox and Opera. */
        border: none;
        /* Needs to be in here for Safari polyfill so background images work as expected. */
        background-size: auto;
    }
    progress:not([value]), progress:not([value])::-webkit-progress-bar {
        background: repeating-linear-gradient(45deg, #7e7e7e, #7e7e7e 10px, #5c5c5c 10px, #5c5c5c 20px);
    }
    .progress-bar-interrupted, .progress-bar-interrupted::-webkit-progress-bar {
        background: #F44336;
    }
</style>
</div>
</div>
<div class="jp-OutputArea-child">
<div class="jp-OutputPrompt jp-OutputArea-prompt"></div>
<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output" data-mime-type="text/html" tabindex="0">
</div>
</div>
<div class="jp-OutputArea-child jp-OutputArea-executeResult">
<div class="jp-OutputPrompt jp-OutputArea-prompt">Out[ ]:</div>
<div class="jp-RenderedText jp-OutputArea-output jp-OutputArea-executeResult" data-mime-type="text/plain" tabindex="0">
<pre>'badminton'</pre>
</div>
</div>
</div>
</div>
</div>
<div class="jp-Cell jp-MarkdownCell jp-Notebook-cell" id="cell-id=35cb68b9">
<div class="jp-Cell-inputWrapper" tabindex="0">
<div class="jp-Collapser jp-InputCollapser jp-Cell-inputCollapser">
</div>
<div class="jp-InputArea jp-Cell-inputArea"><div class="jp-InputPrompt jp-InputArea-prompt">
</div><div class="jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput" data-mime-type="text/markdown">
<h3 id="Thank-You!">Thank You!<a class="anchor-link" href="#Thank-You!">¶</a></h3><p>I hope this small project helped you understand not just how to train a deep learning model, but also how to interpret its performance and put it to practical use. If you found even a small part of it useful, my efforts are successful.</p>
<p>Till next time, happy learning!</p>
<p>You can find the source code of this blog post which is actually a Jupyter notebook <a href="https://github.com/commentedout/racquet_identifier">here</a>.</p>

</div>
</div>
</div>
</div>
</main>
</div>