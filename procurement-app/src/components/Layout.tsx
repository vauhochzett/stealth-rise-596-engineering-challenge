import { NavLink, Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary mb-4 border-bottom">
        <div className="container">
          <NavLink className="navbar-brand fw-semibold" to="/requests">
            Procurement Portal
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav ms-auto gap-2">
              <li className="nav-item">
                <NavLink className="nav-link" to="/requests">
                  Overview
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="btn btn-primary" to="/requests/new">
                  + New Request
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="container pb-4">
        <Outlet />
      </main>
    </>
  )
}

export default Layout

