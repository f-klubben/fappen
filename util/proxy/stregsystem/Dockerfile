FROM fedora:latest

ARG workdir=/home/stregsystemet
ARG author="FRITFIT"
ARG source_repo="https://github.com/f-klubben/stregsystemet.git"

RUN dnf install python3-pip gcc python3-devel python3.7 git -y
RUN dnf clean all

RUN mkdir $workdir
WORKDIR $workdir
RUN git clone $source_repo .

LABEL org.opencontainers.image.authors=$author

RUN python3.7 -m venv venv
RUN /bin/bash -c "source venv/bin/activate && pip install -r requirements.txt"
RUN /bin/bash -c "source venv/bin/activate && python manage.py migrate"
CMD [ "/bin/bash", "-c", "source venv/bin/activate && python manage.py migrate && python manage.py loaddata stregsystem/fixtures/testdata.json && python manage.py runserver 0:8000" ]