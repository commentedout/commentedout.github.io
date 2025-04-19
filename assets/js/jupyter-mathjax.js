init_mathjax = function () {
    if (window.MathJax) {
        // MathJax loaded
        MathJax.Hub.Config({
            TeX: {
                equationNumbers: {
                    autoNumber: "AMS",
                    useLabelIds: true
                }
            },
            tex2jax: {
                inlineMath: [['$', '$'], ["\\(", "\\)"]],
                displayMath: [['$$', '$$'], ["\\[", "\\]"]],
                processEscapes: true,
                processEnvironments: true
            },
            displayAlign: 'center',
            messageStyle: 'none',
            CommonHTML: {
                linebreaks: {
                    automatic: true
                }
            }
        });

        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }
}
init_mathjax();