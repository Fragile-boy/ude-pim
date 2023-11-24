<template>
    <div id="layoutError">
        <div id="layoutError_content">
            <main>
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-6">
                            <div class="text-center mt-4">
                                <img class="mb-4 img-error" src="@/assets/error-404.svg" />
                                <p class="lead">您请求的页面不见了，请检查路径.</p>
                                <router-link to="/common/index">
                                    <i class="fas fa-arrow-left me-1"></i>
                                    返回主页
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        <div id="layoutError_footer">
            <footer class="py-4 bg-light mt-auto">
                <div class="container-fluid px-4">
                    <div class="d-flex align-items-center justify-content-between small">
                        <div class="text-muted">Copyright &copy; UDE 2023</div>
                        <div>
                            <a href="#">Privacy Policy</a>
                            &middot;
                            <a href="#">Terms &amp; Conditions</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>

<script>

export default {

}
</script>

<style>
@import url('@/css/styles.css');
#layoutError {
    width: 100%;
}
</style>