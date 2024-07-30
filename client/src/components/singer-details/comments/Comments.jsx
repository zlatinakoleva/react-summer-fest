import './Comments.scss'

export default function Comments() {
    return (
        <>
            <section className="section-comments">
                <div className="shell">
                    <div className="section__inner">
                        <div className="section__head">
                            <h2>Comments</h2>
                        </div>

                        <div className="section__body">
                            <div className="grid">
                                <div className="grid__col grid__col--1of2">
                                    <div className="section__form">
                                        <div className="form form--alt">
                                            <div className="form__head">
                                                <h4>Leave Comment</h4>
                                            </div>

                                            <div className="form__body">
                                                <form>
                                                    <div className="form__row">
                                                        <label htmlFor="email" className="form__label">Comment</label>
                                                        
                                                        <div className="form__controls">
                                                            <textarea name="comment" id="" placeholder="My favorite song is..."></textarea>
                                                        </div>
                                                    </div>

                                                    <div className="form__actions">
                                                        <button className="btn secondary" type="submit" value="Submit">Submit</button>
                                                    </div>
                                                </form>
                                            </div>

                                            <div className="form__list">
                                                <ul className="list-comments">
                                                    <li>
                                                        <div className="comment">
                                                            <div className="comment__head">
                                                                <h5>John Smith</h5>
                                                                <small>August 01, 2024</small>
                                                            </div>
                                                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, magni?</p>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="comment">
                                                            <div className="comment__head">
                                                                <h5>John Smith</h5>
                                                                <small>August 01, 2024</small>
                                                            </div>
                                                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, magni?</p>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="comment">
                                                            <div className="comment__head">
                                                                <h5>John Smith</h5>
                                                                <small>August 01, 2024</small>
                                                            </div>
                                                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, magni?</p>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="comment">
                                                            <div className="comment__head">
                                                                <h5>John Smith</h5>
                                                                <small>August 01, 2024</small>
                                                            </div>
                                                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, magni?</p>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="comment">
                                                            <div className="comment__head">
                                                                <h5>John Smith</h5>
                                                                <small>August 01, 2024</small>
                                                            </div>
                                                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi, magni?</p>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid__col grid__col--1of2">
                                    <div className="section__content">
                                        <div className="section__entry">
                                            <h3>Share Your Favorite Song <br />and Win Big! 🎶✨</h3>
                                            <p>Leave a comment below with your favorite song by [name] and you'll automatically be entered into our special raffle.</p>
                                            <p>You have a chance to win one of three amazing vouchers worth <span>$300</span>, <span>$200</span> or <span>$100</span>!</p>
                                            <p>Don't miss out on this opportunity to win! Just share your favorite song and you might be one of the lucky winners.</p>
                                            <p>Good luck to all participants! 🎉</p>
                                        </div>

                                        <div className="section__vouchers">
                                            <ul>
                                                <li>
                                                    <div className="voucher">
                                                        <h2>$300</h2>
                                                    </div>
                                                </li>

                                                <li>
                                                    <div className="voucher">
                                                        <h2>$200</h2>
                                                    </div>
                                                </li>

                                                <li>
                                                    <div className="voucher">
                                                        <h2>$100</h2>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="section__content-foot">
                                            <p>The prize will be in the form of a voucher that can be loaded onto the wristbands everyone will receive at the festival or redeemed at the event's cash desk.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}