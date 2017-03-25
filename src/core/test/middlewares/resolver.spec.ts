import * as sinon from 'sinon';
import { expect } from 'chai';
import { MiddlewaresResolver } from '../../middlewares/resolver';
import { MiddlewaresContainer } from '../../middlewares/container';
import { Component } from '../../../common/utils/component.decorator';
import { NestMiddleware } from '../../middlewares/interfaces/nest-middleware.interface';
import { RoutesMapper } from '../../middlewares/routes-mapper';
import { Logger } from '../../../common/services/logger.service';
import { NestMode } from '../../../common/enums/nest-mode.enum';

describe('MiddlewaresResolver', () => {
    @Component()
    class TestMiddleware implements NestMiddleware {
        resolve() {
            return (req, res, next) => {}
        }
    }

    let resolver: MiddlewaresResolver;
    let container: MiddlewaresContainer;
    let mockContainer: sinon.SinonMock;

    before(() => Logger.setMode(NestMode.TEST));

    beforeEach(() => {
        container = new MiddlewaresContainer(new RoutesMapper());
        resolver = new MiddlewaresResolver(container);
        mockContainer = sinon.mock(container);
    });

    it('should resolve middleware instances from container', () => {
        const loadInstanceOfMiddleware = sinon.stub(resolver['instanceLoader'], 'loadInstanceOfMiddleware');
        const middlewares = new Map();
        const wrapper = {
            instance: { metatype: {} },
            metatype: TestMiddleware
        };
        middlewares.set('TestMiddleware', wrapper);

        const module = <any>{ metatype: { name: '' }};
        mockContainer.expects('getMiddlewares').returns(middlewares);
        resolver.resolveInstances(module, null);

        expect(loadInstanceOfMiddleware.callCount).to.be.equal(middlewares.size);
        expect(loadInstanceOfMiddleware.calledWith(
            wrapper,
            middlewares,
            module
        )).to.be.true;

        loadInstanceOfMiddleware.restore();
    });
});