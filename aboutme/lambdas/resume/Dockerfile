# Credit: https://github.com/samoconnor/lambdalatex
FROM amazonlinux

# The TeXLive installer needs md5 and wget.
RUN yum update -y && yum install -y \
    fontconfig \
    perl-Digest-MD5 \
    wget

WORKDIR /var/src

# Add TeXLive installer.
COPY install-tl-unx.tar.gz .

# Minimal TeXLive configuration profile.
COPY texlive.profile .

# Intstall base TeXLive system.
RUN mkdir install-tl-unx \
    && tar xzf install-tl-unx.tar.gz -C install-tl-unx --strip-components=1 \
    && cd install-tl-unx \
    && ./install-tl --profile ../texlive.profile

## Install extra packages.
#RUN tlmgr install xcolor \
#                  tcolorbox \
#                  pgf \
#                  environ \
#                  trimspaces \
#                  etoolbox \
#                  booktabs \
#                  lastpage \
#                  pgfplots \
#                  marginnote \
#                  tabu \
#                  varwidth \
#                  makecell \
#                  enumitem \
#                  setspace \
#                  xwatermark \
#                  catoptions \
#                  ltxkeys \
#                  framed \
#                  parskip \
#                  endnotes \
#                  footmisc \
#                  zapfding \
#                  symbol \
#                  lm \
#                  sectsty \
#                  stringstrings \
#                  koma-script \
#                  multirow \
#                  calculator \
#                  adjustbox \
#                  xkeyval \
#                  collectbox \
#                  siunitx \
#                  l3kernel \
#                  l3packages \
#                  helvetic \
#                  charter
#

ENV PATH=/var/task/texlive/2017/bin/x86_64-linux/:$PATH

# Install XeTeX
RUN tlmgr install \
    etoolbox \
    fontspec \
    parskip \
    xetex

# Remove LuaTeX.
#RUN tlmgr remove --force luatex
#
## Remove large unneeded files.
#RUN rm -rf /var/task/texlive/2017/tlpkg/texlive.tlpdb* \
#           /var/task/texlive/2017/texmf-dist/source/latex/koma-script/doc \
#           /var/task/texlive/2017/texmf-dist/doc 
#
#RUN mkdir -p /var/task/texlive/2017/tlpkg/TeXLive/Digest/ && \
#    mkdir -p /var/task/texlive/2017/tlpkg/TeXLive/auto/Digest/MD5/ && \
#    cp /usr/lib64/perl5/vendor_perl/Digest/MD5.pm \
#       /var/task/texlive/2017/tlpkg/TeXLive/Digest/ && \
#    cp /usr/lib64/perl5/vendor_perl/auto/Digest/MD5/MD5.so \
#       /var/task/texlive/2017/tlpkg/TeXLive/auto/Digest/MD5

WORKDIR /app

COPY resume.cls resume.tex ./

CMD ["/bin/bash"]
#CMD ["xelatex", "resume.tex"]

#FROM lambci/lambda:build-python3.6
#
#WORKDIR /var/task
#
#ENV PATH=/var/task/texlive/2017/bin/x86_64-linux/:$PATH
#ENV PERL5LIB=/var/task/texlive/2017/tlpkg/TeXLive/
#
#COPY --from=0 /var/task/ /var/task/
#COPY lambda_function.py /var/task
